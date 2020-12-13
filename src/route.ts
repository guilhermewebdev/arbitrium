import { ServerRequest } from 'https://deno.land/std@0.80.0/http/server.ts';
import { RequestListener } from './server.ts';

const URL_REGEX = /^\<[A-z]{1,}\:(number|str)\>$/g


class TYPES {
    number = Number;
    str = String;
}

const types = new TYPES()

export class Path {
    public readonly isRegex: boolean;
    public readonly path: string;
    public readonly _type?: keyof TYPES;
    public readonly variable?: string;

    constructor(path: string) {
        this.isRegex = URL_REGEX.test(path);
        this.path = path;
        if (this.isRegex) {
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
        const typeMatch = (this.isRegex && !!this.type(path));
        return typeMatch || path === this.path;
    }

    public getValue(path: string) {
        return this.type(path);
    }
}

const filterPath = (item: string, index: number, array: string[]): boolean => !!item; 

export default class Route {
    private _path: Path[];
    private _view: RequestListener;

    constructor(path: string, view: RequestListener) {
        this._path = path.split('/')
            .filter(filterPath)
            .map(item => new Path(item));
        this._path.unshift(new Path(''));
        this._view = view;
    }

    get path() { return this._path; }
    get view() { return this._view; }

    public match(path: string): boolean {
        const arrayPath = path.split('/').filter(filterPath);
        arrayPath.unshift('');
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