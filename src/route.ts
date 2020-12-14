import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener, Response } from './server.ts';

const URL_REGEX = /^\<([A-z]{1,})\:(number|str)\>$/g

class TYPES {
    number = Number;
    str = String;
}

const types = new TYPES()

export class Path {
    public readonly hasProp: boolean;
    public readonly path: string;
    public readonly _type?: keyof TYPES;
    public readonly variable?: string;

    constructor(path: string) {
        this.hasProp =  /^\<([A-z]{1,})\:(number|str)\>$/g.test(path);
        this.path = path;
        if (this.hasProp) {
            this.variable = this.getVariable(path);
            this._type = this.getType(path);
        }
    }

    get type(){
        if (this._type) return types[this._type];
        return (value: any) => value; 
    }

    private getVariable(path: string): string {
        return path.split(':')[0].slice(1);
    }

    private getType(path: string): keyof TYPES | undefined {
        const type = path.split(':')[1].slice(0, -1);
        // @ts-ignore
        if(type in types) return type;
    }

    public check(path: string): boolean {
        const typeMatch = (this.hasProp && !!this.type(path));
        return typeMatch || path === this.path;
    }

    public getValue(path: string) {
        return this.type(path);
    }
}

export default class Route {
    private _path: Path[];
    private _view: RequestListener;

    constructor(path: string, view: RequestListener) {
        this._path = Route.pathToArray(path).map(item => new Path(item));;
        this._view = view;
    }

    get path() { return this._path; }
    get view() { return this._view; }

    static pathToArray(path: string){
        const newPath = path.split('/')
            .filter(item => !!item)
        newPath.unshift('');
        return newPath;
    }

    public match(path: string): boolean {
        const arrayPath = Route.pathToArray(path)
        if (arrayPath.length !== this._path.length) return false;
        return arrayPath.length === arrayPath.filter((value, index) => {
            return this._path[index].check(value);
        }).length;
    }

    public getArgs(url: string) {
        const args = {};
        const urlArray = url.split('/')
            .filter(item => !!item);
        this._path
            .filter(path => path.hasProp)
            .forEach((path, index) => {
                Object.assign(args, {
                    // @ts-ignore
                    [path.variable]: path.getValue(urlArray[index])
                })
            })
        return args;
    }

    public run(request: ServerRequest) {
        const url = new URL(request.url || '');
        return this._view(request, this.getArgs(url.pathname))
    }

}

export const route = (path: string, view: RequestListener): Route => {
    return new Route(path, view);
}