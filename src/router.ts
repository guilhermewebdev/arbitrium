import Route from './route';

export default class Router {
    private _routes: Array<Route>;

    constructor(routes: Array<Route>){
        this._routes = routes;
    }

    get routes(){
        return this._routes;
    }
}