import http from 'http';
import http2 from 'http2';
import https from 'https';
import Router from './router';

export type ServerResponse = http.ServerResponse | http2.Http2ServerResponse;
export type ServerRequest = http2.Http2ServerRequest | https. | http.IncomingMessage;
export type HttpServer = http.Server | http2.Http2Server | https.Server;

export interface ServerConfig {
    router: Router;
    port?: number;
    host?: string;
    useHttps?: boolean;
    useHttp2?: boolean;
}

export default class Server {
    private _useHttps: boolean;
    private _useHttp2: boolean;
    private _server: HttpServer;
    private _port: number;
    private _host: string;
    private _router: Router;

    constructor({ router, port = 8080, host = 'localhost', useHttp2 = false, useHttps = false }: ServerConfig) {
        this._router = router;
        this._useHttp2 = useHttp2;
        this._useHttps = useHttps;
        this._port = port;
        this._host = host;
        this._server = this.createServer();
    }

    get port() { return this._port; }

    get host() { return this._host; }

    get server() { return this._server; }

    private async handleRequest(request: ServerRequest, response: ServerResponse) {
        this._router.handleRequest(request, response);
    }

    private createServer() {
        if (this._useHttp2) {
            if (this._useHttps) this._server = http2.createSecureServer(this.handleRequest)
            else this._server = http2.createServer(this.handleRequest)
        } else {
            if (this._useHttps) this._server = https.createServer(this.handleRequest)
            else this._server = http.createServer(this.handleRequest)
        }
        return this._server;
    }

    public listen(callback: () => void | undefined) {
        this._server.listen(
            this._port,
            this._host,
            callback,
        );
        return this;
    }
}