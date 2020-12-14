import Server, { RequestListener, Response } from './server.ts';
import Router from './router.ts'
import { route } from './route.ts';
import { assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";

const view: RequestListener = async (request) => {
    const headers = new Headers([
        ['Content-Type', 'text/plain']
    ])
    return new Response('Hello World', 200, headers)
}

Deno.test('Server', async () => {
    const server = new Server({
        router: new Router([
            route('/', view)
        ])
    })
    server.listen()
    await fetch('http://localhost:8080')
        .then(async (data) => {
            assertEquals(await data.text(), 'Hello World')
        })
    await fetch('http://localhost:8080/ddd/4')
        .then(async (data) => {
            assertEquals(data.status, 404, await data.text())
        })
    
    server.stop()
})