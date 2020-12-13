import Route from './route';
import Server, { ServerRequest, ServerResponse } from './server';

export default class Router {
    private _routes: Array<Route>;

    constructor(routes: Array<Route>){
        this._routes = routes;
    }

    get routes(){
        return this._routes;
    }

    public async handleRequest(request: ServerRequest, response: ServerResponse){
        request   
    }
}