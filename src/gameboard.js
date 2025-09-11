// gameboard factory
const createGameboard = () => {
    const SIZE = 10;
    const board = [];
    const ships = [];
    const missedAttacks = new Set(); // this is just an enhanced array method

    // initialize board
    for (let i = 0; i < SIZE; i++) {
        board[i] = [];
        for(let j = 0; j < SIZE; j++) {
            board[i][j] = { // data for each tile
                hasShip: false,
                isHit: false,
                ship: null, // 
                shipSegment: null // which segment of ship (0, 1, 2, etc.)
            };
        }
    }

    // place a ship on the board
    const placeShip = (ship, x, y, isVertical = false) => {
        const length = ship.getLength();

    // ship placement logic:
        if(isVertical) { 
            // false placement possibilities:
            // vertical falsy cases
            if(x + length > SIZE) return false; // cannot place, ship is out of bounds
            for (let i = 0; i < length; i++) {
                if (board[x + i][y].hasShip) return false; // place is occupied
            }
        } else {
            // horizontal falsy cases
            if (y + length > SIZE) return false; // out of bounds too (horizontaly)
            for (let i = 0; i < length; i++) {
                if (board[x][y + i].hasShip) return false; // place is occupied
            }
        }

    // place the ship:
        if(isVertical) {
            // this loops through the whole board and places the ship
            for(let i = 0; i < length; i++) {
                board[x + i][y] = {
                    hasShip: true,
                    isHit: false,
                    ship: ship,
                    shipSegment: i
                };
            }
        } else {
            for(let i = 0; i < length; i++) {
                board[x][y + i] = {
                    hasShip: true,
                    isHit: false,
                    ship: ship,
                    shipSegment: i
                };
            }
        }

        // add ship to the ships array and return true so that the function works
        ships.push(ship);
        return true;
    };

    const receiveAttack = (x, y) => {
        if(x < 0 || x >= SIZE || y < 0 || y >= SIZE) {
            return false; // coordinates out of bounds
        }

        // each cell of the board
        const cell = board[x][y];

        if(cell.isHit) {
            return false; // this part was already hit!
        }
        // hits if it wasnt already hit
        cell.isHit = true;

        if (cell.hasShip) {
            cell.ship.hit(); // register hit on the ship
            return 'hit';
        } else {
            missedAttacks.add(`${x},${y}`); // adds misses information
            return 'miss';
        }
    }

    // check if all ships are sunk
    const allShipsSunk = () => {
        // check if every ship in the ships array returns true for isSunk()
        return ships.every(ship => ship.isSunk());
    };

    // get missed attacks
    const getMissedAttacks = () => {
        return Array.from(missedAttacks).map(coord => {
            const [x, y] = coord.split(',').map(Number);
            return {x, y};
        });
    };

    const getBoardState = () => {
        return board.map(row => row.map(cell => ({
            hasShip: cell.hasShip,
            isHit: cell.isHit,
            isSunk: cell.hasShip ? cell.ship.isSunk() : false
        })));
    };

    return {
        board,
        ships,
        placeShip,
        receiveAttack,
        allShipsSunk,
        getMissedAttacks,
        getBoardState
    }    
};

module.exports = { createGameboard }; // export