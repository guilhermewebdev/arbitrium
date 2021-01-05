import { ServerRequest } from "https://deno.land/std@0.80.0/http/server.ts";
import Route, { Path } from './route.ts';
import { assertArrayIncludes, assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";
import { Response } from './server.ts';

const view = async (request: ServerRequest, args: any) => { return new Response() }

Deno.test('Number path', () => {
    const path = new Path('<user:number>');
    assertEquals(path.hasProp, true, 'Has not prop');
    assertEquals(path.check('43'), true, 'Check don\'t works');
    assertEquals(path.getValue('54'), 54, "getValue don't works");
})

Deno.test('String path', () => {
    const path = new Path('<user:str>');
    assertEquals(path.hasProp, true, 'Has no prop');
    assertEquals(path.check('43'), true, 'Check don\'t works');
    assertEquals(path.getValue('54'), '54', "getValue don't works");
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

Deno.test('Hard test in Path', () => {
    const path = new Path('user-<id:number>sell')
    assertEquals(path.hasProp, true);
    assertEquals(path.variable, 'id');
    assertEquals(path.type, Number);
    assertEquals(path.check('user-4sell'), true)
})

Deno.test('Mixed param', () => {
    const path = '/user-<id:number>';
    const route = new Route(path, view);
    // @ts-ignore
    const hasProp: boolean = route.path.reduce((previous, current) => previous.hasProp || current.hasProp)
    assertEquals(hasProp, true)
    assertEquals(Route.pathToArray(path), ['', 'user-<id:number>'])
    assertEquals(Route.pathToArray('/user-4'), ['', 'user-4'])
    assertEquals(route.path.length, 2, 'Path length ' + route.path)
    assertEquals(route.match('/user-4'), true, '/user-4 don\' passed')
    assertEquals(route.match('/user-t'), false, '/user-t don\'t passed')
})

Deno.test('Multiple params', () => {
    const resource = new Route('/<user:number>/<address:str>/', view);
    assertEquals(resource.path.length, 3, "Resource path length")
    assertEquals(resource.match('/54'), false, "54 at param");
    assertEquals(resource.match('/54/du/'), true, "54 and du at param");
    assertEquals(resource.getArgs('/54/du/'), { user: 54, address: 'du' }, 'getArgs test')
})

Deno.test('Parsing path to array', () => {
    const array1 = Route.pathToArray('/fa/34/fd')
    assertArrayIncludes(array1, ['', 'fa', '34', 'fd'])
    assertEquals(array1.length, 4, 'Array length')
    const array2 = Route.pathToArray('');
    assertArrayIncludes(array2, [''])
    assertEquals(array2.length, 1, 'Array length')
    const array3 = Route.pathToArray('/');
    assertArrayIncludes(array3, [''])
    assertEquals(array3.length, 1, 'Array length')
    const array4 = Route.pathToArray('deno');
    assertArrayIncludes(array4, ['', 'deno'])
    assertEquals(array4.length, 2, 'Array length')
    const array5 = Route.pathToArray('deno/');
    assertArrayIncludes(array5, ['', 'deno'])
    assertEquals(array5.length, 2, 'Array length')
    const array6 = Route.pathToArray('/54/du/');
    assertArrayIncludes(array6, ['', '54', 'du'])
    assertEquals(array6.length, 3, 'Array length')
})