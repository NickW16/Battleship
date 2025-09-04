const { ship } = require('./ship');

const testShip = ship(4);

test('initial hitcount is 0', () => {
  expect(testShip.getHitCount()).toBe(0); 
});

test('length is correct', () => {
  expect(testShip.getLength()).toBe(4);
});