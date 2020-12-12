import Route from './route';
import Server from './server';

export default class Router {
    private _routes: Array<Route>;

    constructor(routes: Array<Route>){
        this._routes = routes;
    }

    get routes(){
        return this._routes;
    }

    public assignServer(server: Server){
        this._routes.forEach(route => route.assignInServer(server))
    }

}