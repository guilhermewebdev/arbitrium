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
    application?: ApplicationInterface;
}

const parses: any = {
    object: function (value: Object) {
        const string = JSON.stringify(value);
        const json = JSON.parse(string);
        return JSON.stringify(json);
    },
    default: function (value: any) {
        return String(value)
    }
}

async function log(type: string, request?: ServerRequest, response?: Response) {
    console.log(`%c[${type}]%c[${new Date()}]: ${response?.status} ${request?.method} ${request?.url} - ${request?.headers.get('User-Agent')}`,
        response?.status === 200 ? 'color:#00F507' : 'color:red', 'color:default'
    )
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

export interface ApplicationInterface {
    router?: Router;
    responder: RequestListener;
    handler: (request: ServerRequest) => Promise<void>
}

export interface ApplicationSettings {
    middlewares?: Middleware[];
    router: Router;
}

export class Application implements ApplicationInterface {
    private _responder: RequestListener;
    readonly middlewares: Middleware[];
    readonly router: Router;

    constructor(settings: ApplicationSettings){
        const { middlewares=[], router } = settings;
        this.middlewares = middlewares;
        this.router = router;
        this._responder = this.iterateMiddlewares()
    }

    get responder(){ return this._responder }

    private iterateMiddlewares(): RequestListener {
        return this.middlewares.reduce((previous, current) => {
            return current(previous)
        }, this.toRouter)
    }

    private toRouter = (request: ServerRequest) => {
        return this.router.handleRequest(request)
    }

    public async handler(request: ServerRequest) {
        try {
            const response = await this.responder(request);
            request.respond(response);
            request.finalize()
            log('REQUEST', request, response)
        }catch(error){
            const response = new Response(error.message, 500);
            request.respond(response);
            request.finalize();
            log('ERROR', request, response)
        }
    }
    
    public addMiddleware(middleware: Middleware){
        const index = this.middlewares.push(middleware);
        this._responder = this.iterateMiddlewares();
        return index;
    }
}

export default class Server {
    private _useHttps: boolean;
    private _server: DenoServer;
    private _port: number;
    private _host: string;
    private _key?: string;
    private _cert?: string;
    readonly application: ApplicationInterface;

    constructor(config: ServerConfig) {
        const { router, port = 8080, application, host = 'localhost', useHttps = false, middlewares = [], key, cert } = config;
        if(useHttps && !('key' in config && 'cert' in config)){
            throw new Error('[ERROR]: If you want use SSL, you should inform the certified and key path')
        }
        this._useHttps = useHttps;
        this._port = port;
        this._host = host;
        this._key = key;
        this._cert = cert;
        this._server = this.createServer();
        this.application = !!application ? application : new Application({ middlewares, router });
    }

    get port() { return this._port; }

    get host() { return this._host; }

    get server() { return this._server; }

    get url() {
        return `http${this._useHttps ? 's' : ''}://${this.host}:${this.port}`
    }

    private createServer(){
        const config = { port: this.port, hostname: this.host }
        // @ts-ignore
        return this._useHttps ? serveTLS({ ...config, certFile: this._cert,  keyFile: this._key }) : serve(config);
    }

    private async startServer(tries=0){
        try{
            for await (const request of this._server) {
                this.application.handler(request);
            }
        }catch(error){
            if(tries < 5) this.startServer(tries + 1);
            throw error;
        }
    }

    public async listen() {
        this.startServer()
        console.log(`\n%c[SERVER RUNNING]%c[${new Date()}]: ${this.url}\n`, 'color:#00F507', 'color:default')
    }
    
    public stop(){
        this.server.close()
        console.log(`%c[SERVER STOPPED]%c[${new Date()}]`, 'color:red', 'color:default')
    }

}

export function serverFactory(config: ServerConfig){
    return new Server(config);
}