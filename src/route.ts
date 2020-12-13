import http from 'http';
import Server from './server';

export default class Route {
    private _path: string;
    private _view: http.RequestListener;
    private _method: string;

    constructor(path: string, view: http.RequestListener, method = 'use') {
        this._path = path;
        this._view = view;
        this._method = method;
    }

    public assignInServer(server: Server): Server {
        server.server.on(this._method, this._view);
        return server;
    }

}

export const route = (path: string, view: http.RequestListener, method = 'use') => {
    return new Route(path, view, method);
}