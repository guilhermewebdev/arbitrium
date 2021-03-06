import Server, { RequestListener, Response } from 'https://deno.land/x/arbitrium@v0.1.0-alpha.2/src/server.ts';
import Router from 'https://deno.land/x/arbitrium@v0.1.0-alpha.2/src/router.ts';
import { route } from 'https://deno.land/x/arbitrium@v0.1.0-alpha.2/src/route.ts';
import { ServerRequest } from "https://deno.land/std@0.80.0/http/server.ts";

async function view(request: ServerRequest, args?: {}) {
    // Write views to process the request, and return a response
    return new Response('Hello World');
}

async function viewWithParam(request: ServerRequest, args?: {}) {
    // You can get the url params from "args" variable
    return new Response(args, 200, 'application/json')
}

function middleware(getResponse: RequestListener) {
    // One-time configuration and initialization.
    console.log('On Start Application')
    return async function(request: ServerRequest) {
        // Code to be executed for each request before
        // the view (and later middleware) are called.
        console.log('On Request')
        const response = await getResponse(request);
        // Code to be executed for each request/response after
        // the view is called.
        console.log('On Response')
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

// To start server is just call the ".listen()" Server method
server.listen()

