const player = require('../player');

test('testing', () => {
    const playerTest = player;
    expect(typeof playerTest).toBe('object');
})