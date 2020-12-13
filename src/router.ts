import Route from './route';
import Server, { ServerRequest, ServerResponse } from './server';
import { URL } from 'url';

export default class Router {
    private _routes: Array<Route>;
    private _defaultRoute: Route;

    constructor(routes: Array<Route>, defaultRoute?: Route) {
        this._routes = routes;
        this._defaultRoute = defaultRoute || new Route('', () => { })
    }

    get routes() { return this._routes; }

    private findRoute(path: string): Route {
        return this._routes.find(route => route.match(path)) || this._defaultRoute;
    }

    public async handleRequest(request: ServerRequest, response: ServerResponse) {
        const url = new URL(request.url || '');
        const route = this.findRoute(url.pathname);
    }
}