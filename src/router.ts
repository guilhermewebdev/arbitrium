import Route from './route';

export default class {
    private _routes: Array<Route>;

    constructor(routes: Array<Route>){
        this._routes = routes;
    }

    get routes(){
        return this._routes;
    }
}