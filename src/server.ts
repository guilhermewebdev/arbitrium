import { serve, Server as DenoServer, ServerRequest, Response as DenoResponse, serveTLS } from 'https://deno.land/std@0.80.0/http/server.ts';
import Router from './router.ts';

export interface RequestListener {
    (request: ServerRequest, args?: {}): Promise<Response>;
}

export interface Middleware {
    (getResponse: RequestListener): RequestListener;
}

export interface ServerConfig {
    router: Router;
    middlewares?: Middleware[];
    port?: number;
    host?: string;
    useHttps?: boolean;
    cert?: string;
    key?: string;
}

const parses: any = {
    object: function (value: Object) {
        const string = JSON.stringify(value);
        const json = JSON.parse(string);
        return JSON.stringify(json);
    },
    default: function (value: any) {
        return JSON.stringify(value)
    }
}

export class Response implements DenoResponse {
    status?: number;
    headers?: Headers;
    body?: Uint8Array | Deno.Reader | string;
    type: string;
    trailers?: () => Promise<Headers> | Headers;

    constructor(body: any = '', status=200, headers?: Headers){
        this.type = typeof body;
        this.body = body;
        this.status = status;
        this.headers = headers;
        this.parseBody()
    }

    parseBody(){
        if(parses[this.type]){
            const parser = parses[this.type];
            this.body = parser(this.body)
        }else{
            this.body = parses.default(this.body)
        }
        return this.body;
    }

}

export default class Server {
    private _useHttps: boolean;
    private _server: DenoServer;
    private _port: number;
    private _host: string;
    private _router: Router;
    private _middlewares: Middleware[];
    private _key?: string;
    private _cert?: string;

    constructor(config: ServerConfig) {
        const { router, port = 8080, host = 'localhost', useHttps = false, middlewares = [], key, cert } = config;
        if(useHttps && !('key' in config && 'cert' in config)){
            throw new Error('ERROR: If you want use SSL, you should inform the certified and key path')
        }
        this._router = router;
        this._middlewares = middlewares;
        this._useHttps = useHttps;
        this._port = port;
        this._host = host;
        this._key = key;
        this._cert = cert;
        this._server = this.createServer()
    }

    get port() { return this._port; }

    get host() { return this._host; }

    get server() { return this._server; }

    private createServer(){
        const config = { port: this.port, hostname: this.host }
        // @ts-ignore
        return this._useHttps ? serveTLS({ ...config, certFile: this._cert,  keyFile: this._key }) : serve(config);
    }

    private async iterateMiddlewares(getResponse: RequestListener, request: ServerRequest, index=0): Promise<Response>{
        if (this._middlewares.length >= index) return getResponse(request);
        const builder = this._middlewares[index];
        const middleware = builder(getResponse);
        return this.iterateMiddlewares(middleware, request, index + 1);
    }

    private async handleRequest(request: ServerRequest) {
        try {
            const toRouter = (routerRequest: ServerRequest) => this._router.handleRequest(routerRequest)
            const response = await this.iterateMiddlewares(toRouter, request);
            request.respond(response);
            return request.finalize()
        }catch(error){
            request.respond(new Response(error.message, 500))
        }
    }

    private async startServer(){
        try{
            for await (const request of this._server) {
                this.handleRequest(request);
            }
        }catch(error){
            return error;
        }
    }

    public async listen() {
        this.startServer()
            .catch((error) => {
                if(error) this.startServer()
            })
    }

    public stop(){
        return this.server.close()
    }

    public addMiddleware(middleware: Middleware){
        return this._middlewares.push(middleware);
    }

}

export function serverFactory(config: ServerConfig){
    return new Server(config);
}