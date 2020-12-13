import { RequestListener, ServerResponse } from './server';

export default class Route {
    private _path: string;
    private _view: RequestListener;

    constructor(path: string, view: RequestListener) {
        this._path = path;
        this._view = view;
    }

    get path() { return this._path; }
    get view() { return this._view; }

    public match(path: string): boolean {
        return false;
    }

}

export const route = (path: string, view: RequestListener): Route => {
    return new Route(path, view);
}