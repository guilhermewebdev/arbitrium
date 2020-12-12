import http from 'http';
import http2 from 'http2';
import https from 'https';

export default class {
    private _useHttps: boolean;
    private _useHttp2: boolean;
    private _server: http.Server | http2.Http2Server | https.Server;

    constructor(useHttps: boolean = false, useHttp2: boolean = false) {
        this._useHttp2 = useHttp2;
        this._useHttps = useHttps;
        if (useHttp2) {
            if (useHttps) this._server = http2.createSecureServer()
            else  this._server = http2.createServer()
        } else {
            if (useHttps) this._server = https.createServer()
            else this._server = http.createServer()
        }
    }
}