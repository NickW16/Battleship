const { createPlayer } = require('../player');

test('testing player gameboard', () => {
    const playerTest = createPlayer();
    expect(playerTest.gameboard.getMissedAttacks).toBeInstanceOf(Object);
});
