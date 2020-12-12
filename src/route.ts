import http from 'http';

export default class Route {
    private _path: string;
    private _view: http.RequestListener;
    private _method: string;

    constructor(path: string, view: http.RequestListener, method = 'use') {
        this._path = path;
        this._view = view;
        this._method = method;
    }

    public assignInServer(server: http.Server): http.Server {
        server.on(this._method, this._view);
        return server;
    }

}