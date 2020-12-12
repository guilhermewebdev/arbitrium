const Router = require('./router');
const Route = require('./route');

describe('Test the router class', () => {
    test('Instance router class', () => {
        const router = Router([
            Route('/', console.log)
        ])
    })
})