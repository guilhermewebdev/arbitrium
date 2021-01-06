# Arbitrium  
Arbitrium is a web micro-framework for Deno. It's designed to create a MVC controllers, making available an async web server and a router, to make get started a powerful applications.  
  
# A Simple Example  
```typescript
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
    return new Response(args, 200, 'application/json')
}

const router = new Router([
    // You can set the routes to call a view
    route('/', view),
    // You can pass url params
    route('/<id:number>', viewWithParam),
])

function middleware(getResponse: RequestListener){
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

// To create a server, is just instance the "Server" class with configs
const server = new Server({ router, middlewares: [middleware] });

// To start server is just call the ".listen()" Server method
server.listen()

```  

```sh
$ deno --allow-net example/simple.ts
    Check file:///path/to/arbitrium/example/simple.ts
    On Start Application
    [SERVER RUNNING]: ON http://localhost:8080 (Press CTRL+C to quit)
    
```