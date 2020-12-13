import { ServerRequest } from "https://deno.land/std@0.80.0/http/server.ts";
import Route, { Path } from './route.ts';
import { assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";

const view = (request: ServerRequest, args: any) => {}

Deno.test('Path', () => {
    const path = new Path('<user:number>');
    assertEquals(path.isRegex, true, 'It\'s not RegEx');
    assertEquals(path.check('43'), true, 'Check don\'t works');
    assertEquals(path.getValue('54'), 54, "getValue don't works");
})

Deno.test('Root', () => {
    const root = new Route('/', view);
    assertEquals(root.path.length, 1, "Path length")
    assertEquals(root.match(''), true, "Empty string in root")
    assertEquals(root.match('/'), true, "Single bar root")
})

Deno.test('Number param', () => {
    const user = new Route('/<user:number>', view);
    assertEquals(user.path.length, 2, "Path length")
    assertEquals(user.match('/54'), true, "54 at param");
    assertEquals(user.match('/faf'), false, "String at number param");
    assertEquals(user.getArgs('/45'), { user: 45 });
})