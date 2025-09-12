const { createGameboard } = require('./gameboard');
const { ship } = require('./ship');

// players board initialization
const playerOne = (CPU=false) => {
    const gameboard = createGameboard();
    return {
        gameboard,
    }
};

const playerTwo = (CPU=true) => {
    const gameboard = createGameboard(); 
    return {
        gameboard,
    }
};

// CPU logic

module.exports =  { playerOne, playerTwo };