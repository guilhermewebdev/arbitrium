import Route, { RouteInterface } from './route.ts';
import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener, Response } from './server.ts';

const view404: RequestListener = async (request, args) => {
    return new Response('404 - Page not found', 404)
}

export interface RouterInterface {
    handleRequest: (request: ServerRequest) => Promise<Response>;
}

export default class Router implements RouterInterface {
    private _routes: Array<RouteInterface>;
    private _defaultRoute: RouteInterface;

    constructor(routes: Array<RouteInterface>, defaultRoute?: RouteInterface) {
        this._routes = routes;
        this._defaultRoute = defaultRoute || new Route('', view404);
    }

    get routes() { return this._routes; }

    private findRoute(path: string): RouteInterface {
        return this._routes.find(route => route.match(path)) || this._defaultRoute;
    }

    public async handleRequest(request: ServerRequest) {
        try{
            const route = this.findRoute(request.url);
            return route.handler(request);
        }catch(error){
            return this._defaultRoute.handler(request);
        }
    }
}

export const routerFactory = (routes: RouteInterface[]) => {
    return new Router(routes);
}