import Route from './route.ts';
import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener } from './server.ts';


export default class Router {
    private _routes: Array<Route>;
    private _defaultRoute: Route;

    constructor(routes: Array<Route>, defaultRoute?: Route) {
        this._routes = routes;
        this._defaultRoute = defaultRoute || new Route('', () => { });
    }

    get routes() { return this._routes; }

    private findRoute(path: string): Route {
        return this._routes.find(route => route.match(path)) || this._defaultRoute;
    }

    public handleRequest(request: ServerRequest) {
        const url = new URL(request.url || '');
        const route = this.findRoute(url.pathname);
        try{
            route.run(request);
        }catch(error){
            this._defaultRoute.run(request);
        }
    }
}

export const routerFactory = (routes: Route[]) => {
    return new Router(routes);
}