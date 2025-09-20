const { createGameboard } = require('./gameboard');
const { ship } = require('./ship');

// players board initialization
const createPlayer = (name, CPU=false) => {
    const gameboard = createGameboard();
    return {
        name,
        gameboard,
        isTurn: false, // start with no one's turn, it's handled on game logic
    }
};


// CPU logic

module.exports =  { createPlayer };