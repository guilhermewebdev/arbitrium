import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener, Response } from './server.ts';

type type = {
    parser: any,
    pattern: string
}
class TYPES {
    number: type = {
        parser: Number,
        pattern: '[0-9]'
    };
    str: type = {
        parser: String,
        pattern: '[^/]+',
    };
    uuid: type = {
        parser: String,
        pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    }
}

const types = new TYPES()

export interface RouteInterface {
    match: (path: string) => boolean;
    handler: (request: ServerRequest) => Promise<Response>;
}

export class Path {
    public readonly hasProp: boolean;
    public readonly path: string;
    public readonly _type?: type;
    public readonly variable?: string;
    public readonly URL_REGEX = /\<([A-z]{1,})\:(number|str)\>/;
    public readonly pattern;

    constructor(path: string) {
        this.hasProp =  this.URL_REGEX.test(path);
        this.path = path;
        if (this.hasProp) {
            this.variable = this.getVariable(path);
            this._type = this.getType(path);
            this.pattern = new RegExp(this.path.replace(this.URL_REGEX, this._type.pattern))
        } else {
            this.pattern = new RegExp(this.path)
        }
    }

    get type(){
        if (this._type) return this._type.parser;
        return (value: any) => value; 
    }

    toString = () => this.path;

    private getVariable(path: string): string {
        const variable = this.URL_REGEX.exec(path)
        if(!!variable) return variable[1];
        throw new Error('Invalid URL type')
    }

    private getType(path: string): type {
        const parts = this.URL_REGEX.exec(path)
        // @ts-ignore
        if(!!parts) return types[parts[2]];
        throw new Error('Invalid URL type')
    }

    public check(path: string): boolean {
        return this.pattern.test(path);
    }

    public getValue = (path: string) => this.type(path)
}

export default class Route implements RouteInterface {
    private _path: Path[];
    private _view: RequestListener;

    constructor(path: string, view: RequestListener) {
        this._path = Route.pathToArray(path).map(item => new Path(item));
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

    public handler(request: ServerRequest) {
        return this._view(request, this.getArgs(request.url))
    }

}

export const route = (path: string, view: RequestListener): Route => {
    return new Route(path, view);
}