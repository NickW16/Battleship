const game = require('./game-logic');

// game state
let currentPlayer = playerOne;


// dom stuff
const manageDOM = () => {
    const divTest = document.getElementById('title');
    divTest.textContent = 'Battleship Game';

    // get both gameboards:
    const gameboards = document.querySelectorAll('.gameboard');

    const gameTiles = () => {
        gameboards.forEach(gameboard => {
            // Set up grid layout
            // this styling has to be here
            gameboard.style.display = 'grid';
            gameboard.style.gridTemplateColumns = 'repeat(10, 40px)';
            gameboard.style.gridTemplateRows = 'repeat(10, 40px)';
            gameboard.style.gap = '1px';
            for(let i = 0; i < 100; i++) {
                let tile = document.createElement('div');
                tile.classList.add('board-tile');
                // setting up coordinates for each tile
                const x = Math.floor(i / 10);
                const y = i % 10;
                // 'dataset' does magic
                tile.dataset.x = x;
                tile.dataset.y = y;
                // tile styling is on ./styles.css
                gameboard.appendChild(tile);

                // event listeners for each tile
                tile.addEventListener('click', (e) => {
                    const x = parseInt(tile.dataset.x);
                    const y = parseInt(tile.dataset.y);
                    if (playerOne.playerTurn == true) {
                        tile.classList.add('attacked-tile');
                        playerTwo.gameboard.receiveAttack();
                    };
                });
            }
        });
    };
    
    gameTiles();
};

module.exports = { manageDOM };

