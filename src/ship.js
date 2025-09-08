// ship functionality factory
const ship = (length) => {
  let hitCount = 0;
  let sunk = false;

  // function for when it gets hit
  const hit = () => {
    if(!sunk) { // if it hasnt been sunk yet
      hitCount += 1;
      if (hitCount >= length) {
        sunk = true;
      }
    }
    return hitCount;
  };
  // for exporting
  const isSunk = () => sunk;
  const getHitCount  = () => hitCount;
  const getLength = () => length;

  //return object
  return {
    hit,
    isSunk,
    getHitCount,
    getLength,
  }
};

// available types of ships:
const shipTypes = {
    CARRIER: 5,
    BATTLESHIP: 4,
    DESTROYER: 3,
    SUBMARINE: 3,
    PATROLBOAT: 2,
};

const createFleet = () => {
  return {
    carrier: ship(shipTypes.CARRIER),
    battleship: ship(shipTypes.BATTLESHIP),
    destroyer: ship(shipTypes.DESTROYER),
    submarine: ship(shipTypes.SUBMARINE),
    patrolboat: ship(shipTypes.PATROLBOAT)
  };
};

module.exports = { ship, shipTypes, createFleet };