const createGame = require('./game-logic');
const { createFleet } = require('./ship');
const game = createGame(); // initialize the game

const GAME_PHASES = {
    PLACEMENT: 'placement',
    BATTLE: 'battle',
    GAME_OVER: 'game-over',
}

// start placement:
let currentPhase = GAME_PHASES.PLACEMENT;
let currentPlacingPlayer = game.state.player1;
let currentShipIndex = 0;

const setupGameBoards = (p2CPU = false) => {
    const { player1, player2 } = game.state();
    const fleet1 = createFleet();
    const fleet2 = createFleet();

    // place ships for testing
    player1.gameboard.placeShip(fleet1.carrier, 0, 0);
    player1.gameboard.placeShip(fleet1.battleship, 2, 1);
    player1.gameboard.placeShip(fleet1.destroyer, 4, 2);
    player1.gameboard.placeShip(fleet1.submarine, 6, 3);
    player1.gameboard.placeShip(fleet1.patrolboat, 8, 4);

    // ships for player 2
    player2.gameboard.placeShip(fleet2.carrier, 0, 0, true); // vertical
    player2.gameboard.placeShip(fleet2.battleship, 1, 2, true);
    player2.gameboard.placeShip(fleet2.destroyer, 2, 4, true);
    player2.gameboard.placeShip(fleet2.submarine, 3, 6, true);
    player2.gameboard.placeShip(fleet2.patrolboat, 4, 8, true);
}

// dom stuff
const manageDOM = () => {
    // setup ships' positioning...
    setupGameBoards();

    const title = document.getElementById('title');
    title.textContent = 'Battleship Game';

    // create turn indicator
    const turnIndicator = document.getElementById('turn-indicator');
    turnIndicator.textContent = `Current Turn: ${game.currentPlayer().name}`;

    // appending
    const gameboardsSection = document.getElementById('gameboards-section');
    gameboardsSection.appendChild(document.querySelector('.gameboard'));
   
    // get both gameboards:
    const gameboards = document.querySelectorAll('.gameboard');

    // identify which gameboards belongs to each player:
    gameboards[0].dataset.player = 'player1';
    gameboards[1].dataset.player = 'player2';

    const gameTiles = () => {
        gameboards.forEach((gameboard, index) => {
            // Set up grid layout
            // this styling has to be here
            gameboard.style.display = 'grid';
            gameboard.style.gridTemplateColumns = 'repeat(10, 40px)';
            gameboard.style.gridTemplateRows = 'repeat(10, 40px)';
            gameboard.style.gap = '1px';
            gameboard.style.border = '3px solid #333';
            gameboard.style.padding = '10px';
            
            // add player labels
            const playerLabel = document.createElement('div');
            playerLabel.textContent = `${index === 0 ? 'Player 1' : 'Player 2'}'s Board`;
            playerLabel.style.gridColumn = '1 / -1';
            playerLabel.style.textAlign = 'center';
            playerLabel.style.fontWeight = 'bold';
            playerLabel.style.marginBottom = '10px';
            gameboard.parentNode.insertBefore(playerLabel, gameboard);

            for(let i = 0; i < 100; i++) {
                let tile = document.createElement('div');
                tile.classList.add('board-tile');

                // setting up coordinates for each tile
                const x = Math.floor(i / 10);
                const y = i % 10;

                // 'dataset' does magic
                tile.dataset.x = x;
                tile.dataset.y = y;
                tile.dataset.player = index === 0 ? 'player1' : 'player2';
                // tile styling is on ./styles.css
                gameboard.appendChild(tile);

                // event listeners for each tile
                tile.addEventListener('click', (e) => {
                    if (game.isGameOver()) return; // ends if gameover

                    const x = parseInt(tile.dataset.x);
                    const y = parseInt(tile.dataset.y);
                    const boardPlayer = tile.dataset.player;

                    // determine attacker and defender
                    const currentPlayer = game.currentPlayer();
                    const isPlayer1Attacking = currentPlayer.name === 'Player 1' && boardPlayer === 'player2';
                    const isPlayer2Attacking = currentPlayer.name === 'Player 2' && boardPlayer === 'player1';

                    // attack logic
                    if (isPlayer1Attacking || isPlayer2Attacking) {
                        // checks whos the defender
                        const defender = isPlayer1Attacking ? game.state().player2 : game.state().player1;
                        
                        // attack data return:
                        const result = game.attack(currentPlayer, defender, x, y);

                        // updates to hit tile
                        if (result === 'hit') {
                            tile.classList.add('hit');
                            tile.textContent = '💥';
                            console.log('Hit!');
                        // miss tile
                        } else if (result === 'miss') {
                            tile.classList.add('miss');
                            tile.textContent = '💦';
                            console.log('Miss!');
                        // returns if game over
                        } else if (result === 'game-over') {
                            title.textContent = `${currentPlayer.name} Wins!`;
                            turnIndicator.textContent = 'Game Over!';
                            alert(`${currentPlayer.name} wins the game!`);
                            return;
                        }

                        // update turn indicator
                        turnIndicator.textContent = `Current Turn: ${game.currentPlayer().name}`;
                    
                        // disable further clicks on this tile
                        tile.style.pointerEvents = 'none';
                    }
                });
            }            
        });
    }; 
    gameTiles();

};

module.exports = { manageDOM };

