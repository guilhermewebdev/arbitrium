import { ServerRequest } from "https://deno.land/std@0.80.0/http/server.ts";
import Route from './route.ts';
import {
    assertArrayIncludes,
    assertEquals,
  } from "https://deno.land/std@0.80.0/testing/asserts.ts";

const view = (request: ServerRequest, args: any) => {
    return;
}

Deno.test('Test route', () => {
    const route = new Route('/', view);
    assertEquals(route.match(''), true)
})