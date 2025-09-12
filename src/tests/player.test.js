const { playerOne } = require('../player');
const { playerTwo } = require('../player');

test('testing player gameboard', () => {
    const playerTest = playerOne();
    expect(playerTest.gameboard.getMissedAttacks).toBeInstanceOf(Object);
});

test('testing cpu gameboard', () => {
    const cpuTest = playerTwo();
    expect(cpuTest.gameboard.board).toBeInstanceOf(Array);
});