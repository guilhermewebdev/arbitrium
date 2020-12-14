import Server, { RequestListener } from '../src/server.ts';
import Router from '../src/router.ts';
import { route } from '../src/route.ts';
import { ServerRequest } from "https://deno.land/std@0.80.0/http/server.ts";
import { Response } from '../src/server.ts';

async function view(request: ServerRequest, args?: {}) {
    // Write views to process the request, and return a response
    return new Response('Hello World');
}

async function viewWithParam(request: ServerRequest, args?: {}) {
    // You can get the url params from "args" variable
    return new Response(args)
}

function middleware(getResponse: RequestListener) {
    // One-time configuration and initialization.
    return async function(request: ServerRequest) {
        // Code to be executed for each request before
        // the view (and later middleware) are called.
        const response = getResponse(request);
        // Code to be executed for each request/response after
        // the view is called.
        return response;
    }
}

const router = new Router([
    // You can set the routes to call a view
    route('/', view),
    // You can pass url params
    route('/<id:number>', viewWithParam),
])

// To create a server, is just instance the "Server" class with configs
const server = new Server({ router, middlewares: [middleware] });

// To start server is just call the ".listen()" server method
server.listen()

