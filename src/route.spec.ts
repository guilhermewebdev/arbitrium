import { ServerRequest } from "https://deno.land/std@0.80.0/http/server.ts";
import Route from './route.ts';
import { assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";

const view = (request: ServerRequest, args: any) => {
    return;
}

Deno.test('Test route', () => {
    const root = new Route('/', view);
    assertEquals(root.match(''), false)
    assertEquals(root.match('/'), true)
})