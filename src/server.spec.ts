import Server, { RequestListener, Response } from './server.ts';
import Router from './router.ts'
import { route } from './route.ts';
import { assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";

const view: RequestListener = async (request) => {
    return new Response('Hello World')
}

Deno.test('Server', async () => {
    const server = new Server({
        router: new Router([
            route('/', view)
        ])
    })
    await server.listen()
    const response = await fetch('http://localhost:8080')
    assertEquals(response.body, 'Hello World')
})