import http from 'http';


export default class {
    private _path: string;
    private _view: http.RequestListener;

    constructor(path: string, view: http.RequestListener){
        this._path = path;
        this._view = view;
    }

}