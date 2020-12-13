import http from 'http';
import Server from './server';

export default class Route {
    private _path: string;
    private _view: http.RequestListener;

    constructor(path: string, view: http.RequestListener) {
        this._path = path;
        this._view = view;
    }

    get path() { return this._path; }
    get view() { return this._view; }

}

export const route = (path: string, view: http.RequestListener) => {
    return new Route(path, view);
}