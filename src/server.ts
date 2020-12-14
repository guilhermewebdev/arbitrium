import { serve, Server as DenoServer, ServerRequest, Response as DenoResponse } from 'https://deno.land/std@0.80.0/http/server.ts';
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
    useHttp2?: boolean;
    cert?: string;
    key?: string;
}

export class Response implements DenoResponse {
    status?: number;
    headers?: Headers;
    body?: Uint8Array | Deno.Reader | string;
    trailers?: () => Promise<Headers> | Headers;

    constructor(body='', status=200, headers?: Headers){
        this.body = body;
        this.status = status;
        this.headers = headers;
    }
}

export default class Server {
    private _useHttps: boolean;
    private _useHttp2: boolean;
    private _server: DenoServer;
    private _port: number;
    private _host: string;
    private _router: Router;
    private _middlewares: Middleware[];
    private _key?: string;
    private _cert?: string;

    constructor(config: ServerConfig) {
        const { router, port = 8080, host = 'localhost', useHttp2 = false, useHttps = false, middlewares = [], key, cert } = config;
        this._router = router;
        this._middlewares = middlewares;
        this._useHttp2 = useHttp2;
        this._useHttps = useHttps;
        this._port = port;
        this._host = host;
        if(useHttps && !('key' in config && 'cert' in config)){
            throw new Error('ERROR: If you want use SSL, you should inform the certified and key path')
        }
        this._key = key;
        this._cert = cert;
        this._server = serve({ port, hostname: host });
    }

    get port() { return this._port; }

    get host() { return this._host; }

    get server() { return this._server; }

    private async iterateMiddlewares(getResponse: RequestListener, request: ServerRequest, index=0): Promise<Response>{
        const builder = this._middlewares[index];
        if(builder){
            const middleware = builder(getResponse);
            return this.iterateMiddlewares(middleware, request, index + 1);
        }
        return getResponse(request);
    }

    private async handleRequest(request: ServerRequest) {
        const response = await this.iterateMiddlewares(this._router.handleRequest, request);
        request.respond(response);
    }

    public async listen() {
        try{
            for await (const request of this._server) {
                this.handleRequest(request);
            }
        }catch(error){
            return error;
        }
    }

    public stop(){
        return this.server.close()
    }

}

export const serverFactory = (config: ServerConfig) => {
    return new Server(config);
}