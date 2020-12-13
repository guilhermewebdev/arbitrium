import http from 'http';
import http2 from 'http2';
import https from 'https';

type ServerResponse = http.ServerResponse | http2.Http2ServerResponse;
type ServerRequest = http2.Http2ServerRequest | http.ClientRequest | http.IncomingMessage;

export default class Server {
    private _useHttps: boolean;
    private _useHttp2: boolean;
    private _server: http.Server | http2.Http2Server | https.Server;
    private _port: number;
    private _host: string;

    constructor(port: number = 8080, host: string = 'localhost', useHttps: boolean = false, useHttp2: boolean = false) {
        this._useHttp2 = useHttp2;
        this._useHttps = useHttps;
        this._port = port;
        this._host = host;
        this._server = this.createServer();
    }

    get port() { return this._port; }

    get host() { return this._host; }
    
    get server() { return this._server; }

    private handleRequest(req: ServerRequest, res: ServerResponse) {
        
    }

    private createServer(){
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