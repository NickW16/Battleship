const { createPlayer } = require('./player');

const createGame = (isVsCPU = false) => {
    // game state
    const gameState = {
        player1: createPlayer('Player 1'),
        player2: createPlayer(isVsCPU ? 'CPU' : 'Player 2', isVsCPU), //create CPU
        currentPlayer: null,
        gameOver: false
    };
    // set initial turn
    gameState.currentPlayer = gameState.player1;
    gameState.player1.isTurn = true;
    gameState.player2.isTurn = false;

    // logic for turn-switching:
    const switchTurn = () => {
        gameState.currentPlayer.isTurn = false;
        gameState.currentPlayer = gameState.currentPlayer === gameState.player1 
            ? gameState.player2 
            : gameState.player1;
        gameState.currentPlayer.isTurn = true;
    };

    const attack = (attacker, defender, x, y) => {
        if (gameState.gameOver || attacker != gameState.currentPlayer) {
            return false; // not your turn or gameover
        }

        // attacks the tile and outputs the data
        const result = defender.gameboard.receiveAttack(x, y);

        // check if the game is over:
        if (defender.gameboard.allShipsSunk()) {
            gameState.gameOver = true;
            return 'game-over';
        }

        // notify CPU about attack results (for smart AI)
        if (attacker.CPU && attacker.recordAttackResult) {
            attacker.recordAttackResult(x, y, result);
        }

        // switch turns if attack was valid and game isnt over yet
        if (result !== false) {
            switchTurn();
        }

        return result;
    };
    // return public methods and game state
    return {
        state: () => gameState,
        attack,
        switchTurn,
        currentPlayer: () => gameState.currentPlayer,
        isGameOver: () => gameState.gameOver
    };
}

module.exports = createGame;