import Server, { RequestListener } from './server';
import { route } from './route';
import Router from './router';

describe('Teste server', () => {
    test('Instance server', () => {
        const view: RequestListener = (request, response) => {
            response.write('Hello World');
            response.end();
        }
        const router = new Router([
            route('/', view)
        ])
        const server = new Server({ router });
    });
})