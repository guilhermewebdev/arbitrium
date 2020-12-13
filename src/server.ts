import { serve, Server as DenoServer, ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import Router from './router.ts';

export interface ServerConfig {
    router: Router;
    port?: number;
    host?: string;
    useHttps?: boolean;
    useHttp2?: boolean;
    cert?: string;
    key?: string;
}

export interface RequestListener {
    (request: ServerRequest, args: {}): void;
}

export default class Server {
    private _useHttps: boolean;
    private _useHttp2: boolean;
    private _server: DenoServer;
    private _port: number;
    private _host: string;
    private _router: Router;
    private _key?: string;
    private _cert?: string;

    constructor(config: ServerConfig) {
        const { router, port = 8080, host = 'localhost', useHttp2 = false, useHttps = false, key, cert } = config;
        this._router = router;
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

    private handleRequest(request: ServerRequest) {
        return this._router.handleRequest(request);
    }


    public listen(callback: () => void | undefined) {
        for await (const request of this._server) {
            this.handleRequest(request);
        }
    }
}

export const serverFactory = (config: ServerConfig) => {
    return new Server(config);
}