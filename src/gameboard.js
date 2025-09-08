const { ship } = require('./ship');

// gameboard factory
const createGameboard = () => {
    const SIZE = 10;
    const board = [];
    const ships = [];
    const missedAttacks = new Set();

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

    return {
        board,
        ships: [], // array to store placed ships
    }
}