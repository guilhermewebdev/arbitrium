import Server from './server.ts';
import Router from './router.ts'


Deno.test('Server', () => {
    const server = new Server({
        router: new Router([
            
        ])
    })
})