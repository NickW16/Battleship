const { createGameboard } = require('./gameboard');
const { ship, shipTypes } = require('./ship'); // need this too


test('gameboard creates a board array', () => {
  let testGameboard = createGameboard();
  expect(testGameboard.board).toBeInstanceOf(Array); 
});

test('gameboard creates a missed attacks object return', () => {
  let testGameboard = createGameboard();
  expect(testGameboard.getMissedAttacks).toBeInstanceOf(Object); 
});

// horizontal ship placing testing
test('horizontal ships are placed correctly', () => {
    const testGameboard = createGameboard();
    const submarine = ship(shipTypes.SUBMARINE); // create a submarine (length 3)

    // test if placement returns true (success)
    const placementResult = testGameboard.placeShip(submarine, 3, 4, false);
    expect(placementResult).toBe(true);

    // test if the submarine is correctly placed into the ships array
    expect(testGameboard.ships).toContain(submarine);
    expect(testGameboard.ships).toHaveLength(1);

    // check if the ship is properly placed into the board
    expect(testGameboard.board[3][4].hasShip).toBe(true);
    expect(testGameboard.board[3][5].hasShip).toBe(true);
    expect(testGameboard.board[3][6].hasShip).toBe(true);

    // check if gameboard properly returns the ship's name on each board placement
    expect(testGameboard.board[3][4].ship).toBe(submarine);
    expect(testGameboard.board[3][5].ship).toBe(submarine);
    expect(testGameboard.board[3][6].ship).toBe(submarine);

    // verify ship segments are correct
    expect(testGameboard.board[3][4].shipSegment).toBe(0);
    expect(testGameboard.board[3][5].shipSegment).toBe(1);
    expect(testGameboard.board[3][6].shipSegment).toBe(2);
});

test('horizontal ship placement edge cases', () => {
    const testGameboard = createGameboard();
    const destroyer = ship(shipTypes.DESTROYER);

    // testing out of bounds ship (length 3 ship placed in tile 8 or above)
    expect(testGameboard.placeShip(destroyer, 8, 8, false)).toBe(false);
    expect(testGameboard.placeShip(destroyer, 9, 9, false)).toBe(false);

    // test if 2 ships can be placed on the same tile (should return false)
    testGameboard.placeShip(ship(shipTypes.BATTLESHIP), 2, 2, false); // place ship first
    expect(testGameboard.placeShip(destroyer, 2, 2, false)).toBe(false); // overlap, should return false
});

// vertical ship placing testing
test('vertical ships are placed correctly', () => {
    const testGameboard = createGameboard();
    const submarine = ship(shipTypes.SUBMARINE); // create a submarine (length 3)

    // test if placement returns true (success)
    const placementResult = testGameboard.placeShip(submarine, 3, 4, true);
    expect(placementResult).toBe(true);

    // test if the submarine is correctly placed into the ships array
    expect(testGameboard.ships).toContain(submarine);
    expect(testGameboard.ships).toHaveLength(1);

    // check if the ship is properly placed into the board
    expect(testGameboard.board[3][4].hasShip).toBe(true);
    expect(testGameboard.board[4][4].hasShip).toBe(true);
    expect(testGameboard.board[5][4].hasShip).toBe(true);

    // check if gameboard properly returns the ship's name on each board placement
    expect(testGameboard.board[3][4].ship).toBe(submarine);
    expect(testGameboard.board[4][4].ship).toBe(submarine);
    expect(testGameboard.board[5][4].ship).toBe(submarine);

    // verify ship segments are correct
    expect(testGameboard.board[3][4].shipSegment).toBe(0);
    expect(testGameboard.board[4][4].shipSegment).toBe(1);
    expect(testGameboard.board[5][4].shipSegment).toBe(2);
});

test('vertical ship placement edge cases', () => {
    const testGameboard = createGameboard();
    const destroyer = ship(shipTypes.DESTROYER);

    // testing out of bounds ship (length 3 ship placed in tile 8 or above)
    expect(testGameboard.placeShip(destroyer, 8, 8, true)).toBe(false);
    expect(testGameboard.placeShip(destroyer, 9, 9, true)).toBe(false);

    // test if 2 ships can be placed on the same tile (should return false)
    testGameboard.placeShip(ship(shipTypes.BATTLESHIP), 2, 2, true); // place ship first
    expect(testGameboard.placeShip(destroyer, 2, 2, true)).toBe(false); // overlap, should return false
});

