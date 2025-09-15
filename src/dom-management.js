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
                // tile styling is on ./styles.css
                gameboard.appendChild(tile);
            }
        });
    };
    
    gameTiles();
};

module.exports = { manageDOM };

