import Route from './route.ts';
import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener, Response } from './server.ts';

const view404: RequestListener = async (request, args) => {
    return new Response('404 - Page not found' )
}

export default class Router {
    private _routes: Array<Route>;
    private _defaultRoute: Route;

    constructor(routes: Array<Route>, defaultRoute?: Route) {
        this._routes = routes;
        this._defaultRoute = defaultRoute || new Route('', view404);
    }

    get routes() { return this._routes; }

    private findRoute(path: string): Route {
        return this._routes.find(route => route.match(path)) || this._defaultRoute;
    }

    public async handleRequest(request: ServerRequest) {
        try{
            const route = this.findRoute(request.url);
            return route.run(request);
        }catch(error){
            return this._defaultRoute.run(request);
        }
    }
}

export const routerFactory = (routes: Route[]) => {
    return new Router(routes);
}