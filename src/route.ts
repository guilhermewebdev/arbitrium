import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener } from './server.ts';

const URL_REGEX = /^\<[A-z]{1,}\:(number|str)\>$/g


class TYPES {
    number = Number;
    str = String;
}

const types = new TYPES()

class Path {
    public readonly isRegex: boolean;
    public readonly path: string;
    public readonly type?: keyof TYPES;
    public readonly variable?: string;

    constructor(path: string) {
        this.isRegex = URL_REGEX.test(path);
        this.path = path;
        if (this.isRegex) {
            this.variable = this.getVariable(path);
            this.type = this.getType(path);
        }
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
        return this.isRegex || path === this.path
    }

    public getValue(path: string) {
        if (this.type) return types[this.type](path);
    }
}

export default class Route {
    private _path: Path[];
    private _view: RequestListener;

    constructor(path: string, view: RequestListener) {
        this._path = path.split('/').map(item => new Path(item));
        this._view = view;
    }

    get path() { return this._path; }
    get view() { return this._view; }

    public match(path: string): boolean {
        const arrayPath = path.split('/');
        if (arrayPath.length !== this._path.length) return false;
        return arrayPath === arrayPath.filter((value, index) => {
            return this._path[index].check(value);
        })
    }

    private getArgs(url: string) {
        const args = {};
        const urlArray = url.split('/');
        this._path
            .filter(path => path.isRegex)
            .forEach((path, index) => {
                if(path.variable){
                    Object.assign(args, {
                        [path.variable]: path.getValue(urlArray[index])
                    })
                }
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