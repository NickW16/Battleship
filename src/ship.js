// ship factory
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

module.exports = { ship };