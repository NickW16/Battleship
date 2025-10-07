const createGame = require('./game-logic');
const { createFleet, shipTypes, ship } = require('./ship');

const GAME_PHASES = {
    PLACEMENT: 'placement',
    BATTLE: 'battle',
    GAME_OVER: 'game-over',
}

let isVsCPU = true; // for cpu game
let game = createGame(isVsCPU); // initialize the game

// settings dialog section:
const settingsButton = document.getElementById('settings-button');
const settingsDialog = document.getElementById('settings-dialog');
const closeDialog = document.getElementById('close-dialog');

// open dialog
settingsButton.addEventListener('click', () => {
    settingsDialog.showModal();
});

// close dialog
closeDialog.addEventListener('click', () => {
    settingsDialog.close();
});

settingsDialog.addEventListener('close', () => {
    let cpuMode = document.getElementById('cpu-mode');
    if (cpuMode.checked) {
        isVsCPU = true
    } else {
        isVsCPU = false
    }
    restartGame();
});

const restartGame = () => {
    game = createGame(isVsCPU);
    
    // reset game state
    currentPhase = GAME_PHASES.PLACEMENT;
    currentPlacingPlayer = game.state().player1;
    currentShipIndex = 0;

    // these 2 are to properly reset the ui!
    enablePlayerInteractions();
    updateShipPreviewImage();
    
    // clear the boards and reinitialize
    const gameboards = document.querySelectorAll('.gameboard');
    gameboards.forEach(board => {
        board.innerHTML = ''; // clear existing tiles
    });
    
    // reinitialize the game
    manageDOM();
};

// restart button!
const restartButton = document.getElementById('restart-game');
restartButton.addEventListener('click', () => {
    restartGame();
});

// player-switching feature:
const switchPlayer = (player) => {
    const player1Board = document.querySelector('[data-player="player1"]');
    const player2Board = document.querySelector('[data-player="player2"]');

    const playerToShow = player || game.currentPlayer();

    if (playerToShow.name === 'Player 1') {
        player1Board.classList.remove('fogged');
        player2Board.classList.add('fogged');
    } else {
        player2Board.classList.remove('fogged');
        player1Board.classList.add('fogged');
    }    
};

// helper function to get player board's id
const getPlayerBoardId = (player) => {
    if (player.name === 'Player 1') return 'player1';
    if (player.name === 'CPU') return 'player2'; // CPU uses player2's board
    return 'player2'; // player 2 also uses player2's board
};

// updates ship image to the screen!
const updateShipPreviewImage = () => {
    if (currentShipIndex < shipsToPlace.length) {
        const shipName = shipsToPlace[currentShipIndex].name;
        const shipImageEl = document.getElementById('ship-image');
        if (shipImageEl) {
            shipImageEl.style.display = 'block';
            shipImageEl.src = shipImages[shipName];
        }
    } else {
        // hides the ships on battle start!
        const shipImageEl = document.getElementById('ship-image');
        shipImageEl.style.display = 'none';
    }
};

// define stuff for later use in DOM:
let turnIndicator = document.getElementById('turn-indicator');
let title = document.getElementById('title');

// start placement:
let currentPhase = GAME_PHASES.PLACEMENT;
let currentPlacingPlayer = game.state().player1;
let currentShipIndex = 0;

// array with ships to be placed
const shipsToPlace = [
    { name: 'Carrier', length: shipTypes.CARRIER },
    { name: 'Battleship', length: shipTypes.BATTLESHIP },
    { name: 'Destroyer', length: shipTypes.DESTROYER },
    { name: 'Submarine', length: shipTypes.SUBMARINE },
    { name: 'Patrol Boat', length: shipTypes.PATROLBOAT },
];

// images for ships
const shipImages = {
    'Carrier': require('./img/carrier.png'),
    'Battleship': require('./img/battleship.png'),
    'Destroyer': require('./img/destroyer.png'),
    'Submarine': require('./img/submarine.png'),
    'Patrol Boat': require('./img/patrolboat.png'),
};

let isVertical = false; // to track ship orientation


function handlePlacementHover(e) {
    const tile = e.target;
    const x = parseInt(tile.dataset.x);
    const y = parseInt(tile.dataset.y);
    const shipInfo = shipsToPlace[currentShipIndex];
    const length = shipInfo.length;

    const tilesToHighlight = [];
    let isValid = true;

    for (let i = 0; i < length; i++) {
        // logic for vertical/horizontal
        const currentX = isVertical ? x + i : x; 
        const currentY = isVertical ? y : y + i;

        // Check if ship is out of bounds
        if (currentX >= 10 || currentY >= 10) {
            isValid = false;
            break;
        }

        // using helper function to make it easier:
        const playerBoardId = getPlayerBoardId(currentPlacingPlayer);
        const selector = `[data-player="${playerBoardId}"] [data-x="${currentX}"][data-y="${currentY}"]`;
        const segmentTile = document.querySelector(selector);

        // check if tile exists or is already occupied by a placed ship
        if (!segmentTile || segmentTile.classList.contains('ship')) {
            isValid = false;
            break;
        }
        if (segmentTile) {
            // add to array for highlighting:
            tilesToHighlight.push(segmentTile);
        }
    }    
    
    // apply a class based on whether the placement is valid
    const previewClass = isValid ? 'ship-preview' : 'ship-preview-invalid';
    tilesToHighlight.forEach(t => t.classList.add(previewClass));
}
// for when placement phase ends:
function handlePlacementLeave() {
    // find all tiles with a preview class and remove it
    document.querySelectorAll('.ship-preview, .ship-preview-invalid').forEach(tile => {
        tile.classList.remove('ship-preview', 'ship-preview-invalid');
    });
}

function handleAttack(e) {
    // early return if it's CPU's turn
    if (isVsCPU && game.currentPlayer().CPU) {
        return;
    }

    const tile = e.target;
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

        if (game.isGameOver()) {
            // timeout to update ui before ending game
            setTimeout(() => {
                title.textContent = `${currentPlayer.name} Wins!`; // Use the original currentPlayer
                turnIndicator.textContent = 'Game Over!';
                disablePlayerInteractions();
            }, 0);
            return;
        }

        // If the game is not over, switch turns
        switchPlayer();
        turnIndicator.textContent = `Current Turn: ${game.currentPlayer().name}`;

        const nextPlayer = game.currentPlayer();
        // just a little delay for CPU's turn to not be instant
        if (isVsCPU && nextPlayer.CPU) {
            setTimeout(executeCpuTurn, 1000);
        }
    }
};

// function to execute cpu's turn
const executeCpuTurn = () => {
    disablePlayerInteractions();

    const cpu = game.currentPlayer();
    const humanPlayer = game.state().player1;

    // cpu generates coordinates
    const { x, y } = cpu.generateAttack();

    // cpu attacks
    const result = game.attack(cpu, humanPlayer, x, y);

    // update ui
    const attackedTile = document.querySelector(`[data-player="player1"] [data-x="${x}"][data-y="${y}"]`);
    if (attackedTile) {
        if (result === 'hit') {
            attackedTile.classList.add('hit');
            attackedTile.textContent = '💥';
        } else if (result === 'miss') {
            attackedTile.classList.add('miss');
            attackedTile.textContent = '💦';
        }
    }

    if (game.isGameOver()) {
        setTimeout(() => {
            title.textContent = 'CPU Wins!';
            turnIndicator.textContent = 'Game Over!';
            // no need to re-enable interactions here, restart will handle it
        }, 0);
        return;
    }

    // If the game is not over, switch back to human player
    switchPlayer();
    turnIndicator.textContent = `Current Turn: ${game.currentPlayer().name}`;
    enablePlayerInteractions();
};


// this setups the battle phase!
const setupBattlePhase = () => {
    // change phase:
    currentPhase = GAME_PHASES.BATTLE;
    turnIndicator.textContent = 'Battle! Player 1\'s Turn.';
    
    switchPlayer();

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

// function to place cpu ships automatically
const placeCpuShips = () => {
    const cpuPlayer = game.state().player2;
    shipsToPlace.forEach(shipInfo => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const isVertical = Math.random() > 0.5; // randomize if its going to place vertically or not 50/50
            const shipToPlace = ship(shipInfo.length);
            placed = cpuPlayer.gameboard.placeShip(shipToPlace, x, y, isVertical);
        }
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
        // helper function
        const playerBoardId = getPlayerBoardId(currentPlacingPlayer);
        
        // visually update the board to show the placed ship
        for (let i = 0; i < shipInfo.length; i++) {
            const shipX = isVertical ? x + i : x;
            const shipY = isVertical ? y : y + i;
            // huge tile info update:
            const placedTile = document.querySelector(`[data-player="${playerBoardId}"] [data-x="${shipX}"][data-y="${shipY}"]`);        
            if(placedTile) placedTile.classList.add('ship');
        }

        currentShipIndex++; // move to next ship

        
        updateShipPreviewImage();

        // this is to show Which ship is being placed !
        if (currentShipIndex < shipsToPlace.length) {
            turnIndicator.textContent = `Placement Phase: ${currentPlacingPlayer.name}, place your ${shipsToPlace[currentShipIndex].name}`;
        }
        // this player is done placing ships?
        if (currentShipIndex >= shipsToPlace.length) {
            if (isVsCPU) {
                // if its a cpu game, place ships and start battle
                placeCpuShips();
                setupBattlePhase();
            } else if (currentPlacingPlayer.name === 'Player 1') {
                // PvP mode, switch to player 2
                turnIndicator.textContent = 'Player 1 finished. Now player 2 places ships.';
                // switch to player 2
                currentPlacingPlayer = game.state().player2;
                currentShipIndex = 0;
                // re-run setup for Player 2
                switchPlayer(currentPlacingPlayer);
                setupPlacementPhase();
            } else {
                // Both players are done, start the battle (PvP mode)
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

    updateShipPreviewImage();

    switchPlayer(currentPlacingPlayer);

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
    const playerBoardId = getPlayerBoardId(currentPlacingPlayer);
    const playerBoard = document.querySelector(`[data-player="${playerBoardId}"]`);    
    
    playerBoard.querySelectorAll('.board-tile').forEach(tile => {
        // listeners for hovers and placements:
        tile.addEventListener('click', handleShipPlacement);
        tile.addEventListener('mouseover', handlePlacementHover);
        tile.addEventListener('mouseout', handlePlacementLeave);
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

    // this is the starting point of the game logic
    if (currentPhase === GAME_PHASES.PLACEMENT) {
        // add a rotate button to toggle orientation
        let rotateButton = document.getElementById('rotate-button');
        if (!rotateButton) {
            rotateButton = document.createElement('button');
            rotateButton.id = 'rotate-button';
            rotateButton.textContent = 'Rotate Ship (Current: Horizontal)';
            rotateButton.onclick = () => {
                isVertical = !isVertical;
                rotateButton.textContent = `Rotate Ship (Current: ${isVertical ? 'Vertical' : 'Horizontal'})`;
            };
            document.body.insertBefore(rotateButton, document.getElementById('gameboards-section'));            
        }    
        setupPlacementPhase();
    }
};


// board-disabling helper functions:
// disable board:
const disablePlayerInteractions = () => {
    const playerBoard = document.querySelector('[data-player="player1"]');
    const enemyBoard = document.querySelector('[data-player="player2"]');

    // disable player's board
    playerBoard.style.pointerEvents = 'none';
    playerBoard.style.opacity = '0.7';

    // also disable enemy board during CPU turn (for consistency)
    enemyBoard.style.pointerEvents = 'none';
    enemyBoard.style.opacity = '0.7';
};
// enable board:
const enablePlayerInteractions = () => {
    const playerBoard = document.querySelector('[data-player="player1"]');
    const enemyBoard = document.querySelector('[data-player="player2"]');
    
    // enable player's own board
    playerBoard.style.pointerEvents = 'auto';
    playerBoard.style.opacity = '1';
    
    // enable enemy board for attacking
    enemyBoard.style.pointerEvents = 'auto';
    enemyBoard.style.opacity = '1';
};

module.exports = { manageDOM };

