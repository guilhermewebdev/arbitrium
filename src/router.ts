import Route from './route';
import Server, { ServerRequest, ServerResponse } from './server';
import { parse } from 'url'
export default class Router {
    private _routes: Array<Route>;
    private _mapping: any = {};

    constructor(routes: Array<Route>) {
        this._routes = routes;
        this.build()
    }

    get routes() { return this._routes; }

    private build() {
        this._routes.forEach(route => {
            this._mapping[route.path] = route.view;
        })
    }

    public async handleRequest(request: ServerRequest, response: ServerResponse) {
        this._mapping;
    }
}