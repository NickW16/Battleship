const { createGameboard } = require('./gameboard');
const { ship } = require('./ship');

// players board initialization
const createPlayer = (name, CPU=false) => {
    const gameboard = createGameboard();
    const previousAttacks = new Set(); // array to track CPU's attacks!

    const generateAttack = () => {
        let x, y;
        let attackCoord;
        // generate coordinates until we find one that hasn't been attacked yet
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            attackCoord = `${x}, ${y}`;
        } while (previousAttacks.has(attackCoord));
        //append to attacks array:
        previousAttacks.add(attackCoord);
        return { x, y };
    };

    const player = {
        name,
        gameboard,
        isTurn: false, // start with no one's turn, it's handled on game logic
        CPU,
    };

    if (CPU) {
        player.generateAttack = generateAttack;
    }

    return player;
};


// CPU logic

module.exports =  { createPlayer };