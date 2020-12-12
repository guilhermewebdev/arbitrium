import Router from './router';
import Route from './route';

describe('Test the router class', () => {
    test('Instance router class', () => {
        const router = new Router([
            new Route('/', console.log)
        ])
    })
})