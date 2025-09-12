const { createGameboard } = require('../gameboard');
const { ship, shipTypes } = require('../ship'); // need this too


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
//attacks test
test('attacks return false when out of bounds', () => {
  const testGameboard = createGameboard();
  const attack = testGameboard.receiveAttack(11, 12);
  expect(attack).toBe(false);
});

test('attacking a ship', () => {
  const testGameboard = createGameboard();
  const destroyer = ship(shipTypes.DESTROYER);
  testGameboard.placeShip(destroyer, 6, 5, true);
  // it hits
  const attackHits = testGameboard.receiveAttack(7, 5);
  expect(attackHits).toBe('hit');
  // it misses
  const attackMisses = testGameboard.receiveAttack(5, 5);
  expect(attackMisses).toBe('miss');
  // the hit is registered on the ship:
  const boardState = testGameboard.getBoardState();
  const cellHit = boardState[7][5];
  expect(cellHit).toEqual({"hasShip": true, "isHit": true, "isSunk": false});
});

test('missed attacks are properly tracked', () => {
  const testGameboard = createGameboard();

  // misses
  testGameboard.receiveAttack(0, 2);
  testGameboard.receiveAttack(0, 1);
  testGameboard.receiveAttack(0, 3);

  const missedAttacks = testGameboard.getMissedAttacks();
  // test attacks
  expect(missedAttacks).toHaveLength(3);
  expect(missedAttacks).toContainEqual({x: 0, y: 2});
  expect(missedAttacks).toContainEqual({x: 0, y: 1});    
  expect(missedAttacks).toContainEqual({x: 0, y: 3});  
});

test('cant duplicate attacks', () => {
  const testGameboard = createGameboard();
  // attacking to the same tile
  testGameboard.receiveAttack(0, 1);
  testGameboard.receiveAttack(0, 1);

  const missedAttacks = testGameboard.getMissedAttacks();
  expect(missedAttacks).toHaveLength(1);
});

test('complex game scenario', () => {
  const testGameboard = createGameboard();
  const fleet = {
    carrier: ship(shipTypes.CARRIER),
    battleship: ship(shipTypes.BATTLESHIP),
    patrol: ship(shipTypes.PATROLBOAT)
  };

  testGameboard.placeShip(fleet.carrier, 0, 0, false);
  testGameboard.placeShip(fleet.battleship, 4, 5, true);
  testGameboard.placeShip(fleet.patrol, 3, 7, true);

  testGameboard.receiveAttack(0, 0); // hit carrier
  testGameboard.receiveAttack(0, 1); // hit carrier
  testGameboard.receiveAttack(0, 2); // hit carrier
  testGameboard.receiveAttack(0, 3); // hit carrier
  testGameboard.receiveAttack(0, 4); // destroy carrier

  testGameboard.receiveAttack(3, 2); // miss
  testGameboard.receiveAttack(2, 2); // miss
  
  expect(fleet.carrier.isSunk()).toBe(true);
  expect(fleet.battleship.isSunk()).toBe(false);
  expect(fleet.patrol.isSunk()).toBe(false);
  expect(testGameboard.allShipsSunk()).toBe(false);
  expect(testGameboard.getMissedAttacks()).toHaveLength(2);
});
