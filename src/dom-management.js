const createGame = require('./game-logic');
const { createFleet, shipTypes, ship } = require('./ship');
const game = createGame(); // initialize the game

const GAME_PHASES = {
    PLACEMENT: 'placement',
    BATTLE: 'battle',
    GAME_OVER: 'game-over',
}

// define stuff for later use in DOM:
let turnIndicator = document.getElementById('turn-indicator');
let title = document.getElementById('title');

// start placement:
let currentPhase = GAME_PHASES.PLACEMENT;
let currentPlacingPlayer = game.state().player1;
let currentShipIndex = 0;
// array with shipts to be placed
const shipsToPlace = [
    { name: 'Carrier', length: shipTypes.CARRIER },
    { name: 'Battleship', length: shipTypes.BATTLESHIP },
    { name: 'Destroyer', length: shipTypes.DESTROYER },
    { name: 'Submarine', length: shipTypes.SUBMARINE },
    { name: 'Patrol Boat', length: shipTypes.PATROLBOAT },
];

let isVertical = false; // to track ship orientation

function handleAttack(e) {
    const tile = e.target;
    if (game.isGameOver() || tile.classList.contains('hit') || tile.classList.contains('miss')) return;

    const x = parseInt(tile.dataset.x);
    const y = parseInt(tile.dataset.y);
    const boardPlayer = tile.dataset.player;

    // define current player, attacker and defender
    const currentPlayer = game.currentPlayer();
    const defender = (currentPlayer === game.state().player1) ? game.state().player2 : game.state().player1;
    const targetBoardName = (currentPlayer === game.state().player1) ? 'player2' : 'player1';

    // only allow attacking the opponent's board:
    if (boardPlayer === targetBoardName) {
        const result = game.attack(currentPlayer, defender, x, y);

        // visual effects of hitting or missing:
        if (result === 'hit') {
            tile.classList.add('hit');
            tile.textContent = '💥';
        } else if (result === 'miss') {
            tile.classList.add('miss');
            tile.textContent = '💦';
        }

        // update turn indicator's content
        turnIndicator.textContent = `Current Turn: ${game.currentPlayer().name}`;

        if (game.isGameOver()) {
            title.textContent = `${currentPlayer.name} Wins!`;
            turnIndicator.textContent = 'Game Over!';       
        }
    }    
}

// this setups the battle phase!
const setupBattlePhase = () => {
    // change phase:
    currentPhase = GAME_PHASES.BATTLE;
    turnIndicator.textContent = 'Battle! Player 1\'s Turn.';
    
    // clean up placement UI
    const rotateButton = document.querySelector('button');
    if (rotateButton) rotateButton.remove();

    const gameboards = document.querySelectorAll('.gameboard');
    gameboards.forEach(board => {
        const tiles = board.querySelectorAll('.board-tile');
        // remove placement listeners and add attack listeners
        tiles.forEach(tile => {
            // apparently i have to do this for the game to work somehow...
            const newTile = tile.cloneNode(true); // cloning removes old listeners
            tile.parentNode.replaceChild(newTile, tile);
            newTile.addEventListener('click', handleAttack);
        });
    });
};

function handleShipPlacement(e) {
    const tile = e.target;
    const x = parseInt(tile.dataset.x);
    const y = parseInt(tile.dataset.y);
    const shipInfo = shipsToPlace[currentShipIndex];
    
    // temporary ship object info for placement
    const shipToPlace = ship(shipInfo.length);

    if (currentPlacingPlayer.gameboard.placeShip(shipToPlace, x, y, isVertical)) {
        // visually update the board to show the placed ship
        for (let i = 0; i < shipInfo.length; i++) {
            const shipX = isVertical ? x + i : x;
            const shipY = isVertical ? y : y + i;
            // huge tile info update:
            const placedTile = document.querySelector(`[data-player="${currentPlacingPlayer.name.toLowerCase().replace(' ', '')}"] [data-x="${shipX}"][data-y="${shipY}"]`);        
            if(placedTile) placedTile.classList.add('ship');
        }

        currentShipIndex++; // move to next ship

        // this is to show Which ship is being placed !
        if (currentShipIndex < shipsToPlace.length) {
            turnIndicator.textContent = `Placement Phase: ${currentPlacingPlayer.name}, place your ${shipsToPlace[currentShipIndex].name}`;
        }

        // this player is done placing ships?
        if (currentShipIndex >= shipsToPlace.length) {
            // if player 1 is done:
            if (currentPlacingPlayer.name === 'Player 1') {
                turnIndicator.textContent = 'Player 1 finished. Now player 2 places ships.';
                // switch to player 2
                currentPlacingPlayer = game.state().player2;
                currentShipIndex = 0;
                // re-run setup for Player 2
                setupPlacementPhase(); 
            } else {
                // Both players are done, start the battle
                setupBattlePhase();
            }
        }
    } else {
        // placement failed:
        turnIndicator.textContent = 'Invalid Placement, Try again.';
    }
}

const setupPlacementPhase = () => {
    const turnIndicator = document.getElementById('turn-indicator');
    turnIndicator.textContent = `Placement Phase: ${currentPlacingPlayer.name}, place your ${shipsToPlace[currentShipIndex].name}`;

    const gameboards = document.querySelectorAll('.gameboard');
    // remove all old listeners first
    gameboards.forEach(board => {
        // apparently I need "cloneNode" for this game to work...
        board.querySelectorAll('.board-tile').forEach(tile => {
            const newTile = tile.cloneNode(true);
            tile.parentNode.replaceChild(newTile, tile);
        });
    });

    // add listeners only to the current player's board
    const playerBoard = document.querySelector(`[data-player="${currentPlacingPlayer.name.toLowerCase().replace(' ', '')}"]`);
    playerBoard.querySelectorAll('.board-tile').forEach(tile => {
        tile.addEventListener('click', handleShipPlacement);
    });
};


// const setupGameBoards = (p2CPU = false) => {
//     const { player1, player2 } = game.state();
//     const fleet1 = createFleet();
//     const fleet2 = createFleet();

//     // place ships for testing
//     player1.gameboard.placeShip(fleet1.carrier, 0, 0);
//     player1.gameboard.placeShip(fleet1.battleship, 2, 1);
//     player1.gameboard.placeShip(fleet1.destroyer, 4, 2);
//     player1.gameboard.placeShip(fleet1.submarine, 6, 3);
//     player1.gameboard.placeShip(fleet1.patrolboat, 8, 4);

//     // ships for player 2
//     player2.gameboard.placeShip(fleet2.carrier, 0, 0, true); // vertical
//     player2.gameboard.placeShip(fleet2.battleship, 1, 2, true);
//     player2.gameboard.placeShip(fleet2.destroyer, 2, 4, true);
//     player2.gameboard.placeShip(fleet2.submarine, 3, 6, true);
//     player2.gameboard.placeShip(fleet2.patrolboat, 4, 8, true);
// }

// dom stuff
const manageDOM = () => {
    const title = document.getElementById('title');
    title.textContent = 'Battleship Game';

    const turnIndicator = document.getElementById('turn-indicator');
    const gameboards = document.querySelectorAll('.gameboard');

    // identify which gameboards belongs to each player:
    gameboards[0].dataset.player = 'player1';
    gameboards[1].dataset.player = 'player2';

    // change: this part just creates the visual grid ---
    gameboards.forEach((gameboard, index) => {
        gameboard.style.display = 'grid';
        gameboard.style.gridTemplateColumns = 'repeat(10, 40px)';
        gameboard.style.gridTemplateRows = 'repeat(10, 40px)';
        // ... other styles

        for(let i = 0; i < 100; i++) {
            let tile = document.createElement('div');
            tile.classList.add('board-tile');
            const x = Math.floor(i / 10);
            const y = i % 10;
            tile.dataset.x = x;
            tile.dataset.y = y;
            tile.dataset.player = index === 0 ? 'player1' : 'player2';
            gameboard.appendChild(tile);
        }            
    });

    // --- This is the starting point of the game logic ---
    if (currentPhase === GAME_PHASES.PLACEMENT) {
        // add a rotate button to toggle orientation
        const rotateButton = document.createElement('button');
        rotateButton.textContent = 'Rotate Ship (Current: Horizontal)';
        rotateButton.onclick = () => {
            isVertical = !isVertical;
            rotateButton.textContent = `Rotate Ship (Current: ${isVertical ? 'Vertical' : 'Horizontal'})`;
        };
        document.body.insertBefore(rotateButton, document.getElementById('gameboards-section'));
        
        setupPlacementPhase();
    }
};

module.exports = { manageDOM };

