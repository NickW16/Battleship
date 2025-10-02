const { createGameboard } = require('./gameboard');
const { ship } = require('./ship');

// players board initialization
const createPlayer = (name, CPU=false) => {
    const gameboard = createGameboard();
    const previousAttacks = new Set(); // array to track CPU's attacks!

    // smart AI implementation:
    let lastHit = null;
    let hitDirection = null;
    let potentialTargets = [];
    let huntMode = true;

    const generateAttack = () => {
        let x, y;

        if (huntMode) {
            // hunt mode: random until we get a hit
            ({ x, y } = generateRandomAttack());
        } else {
            // target mode: focused search
            ({ x, y } = generateTargetedAttack());
        }
        const attackCoord = `${x}, ${y}`;
        previousAttacks.add(attackCoord);
        return { x, y };
    };    

    // old cpu 'find target' algorithm
    const generateRandomAttack = () => {
        let x, y;
        let attackCoord;

        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            attackCoord = `${x}, ${y}`;
        } while (previousAttacks.has(attackCoord));
        
        return { x, y };
    };

    const generateTargetedAttack = () => {
        // if we have potential targets from previous logic, use them
        if (potentialTargets.length > 0) {
            return potentialTargets.shift(); //get the next target
        }

        // generate targets around the last hit
        const directions = [
            { dx: 1, dy: 0 },  // right
            { dx: -1, dy: 0 }, // left
            { dx: 0, dy: 1 },  // down
            { dx: 0, dy: -1 }  // up
        ];

        // doideira
        // try different directions around the last hit
        for (const dir of directions) {
            const newX = lastHit.x + dir.dx;
            const newY = lastHit.y + dir.dy;
            
            if (isValidAttack(newX, newY)) {
                return { x: newX, y: newY };
            }
        }

        // tf no valid targets found, go back to hunt mode
        huntMode = true;
        lastHit = null;
        return generateRandomAttack();
    };

    const isValidAttack = (x, y) => {
        return x >= 0 && x < 10 && 
               y >= 0 && y < 10 && 
               !previousAttacks.has(`${x}, ${y}`);
    };

    // notify AI about attack results
    const recordAttackResult = (x, y, result) => {
        if (result === 'hit') {
            if (huntMode) {
                // first hit - switch to target mode
                huntMode = false;
                lastHit = { x, y };
                potentialTargets = generateSurroundingTargets(x, y);
            } else {
                // subsequent hit - continue in same direction if possible
                lastHit = { x, y };
                extendTargeting(x, y);
            }
        } else if (result === 'miss' && !huntMode) {
            // miss in target mode - try different direction
            changeTargetingDirection();
        }
        
        // if we run out of potential targets, go back to hunting
        if (!huntMode && potentialTargets.length === 0) {
            huntMode = true;
            lastHit = null;
        }
    };

    const generateSurroundingTargets = (centerX, centerY) => {
        const targets = [];
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, // horizontal
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }  // vertical        
        ];

        // doideira dnv
        for (const dir of directions) {
            const x = centerX + dir.dx;
            const y = centerY + dir.dy;
            if (isValidAttack(x, y)) {
                targets.push({ x, y });
            }
        }

        // shuffle to randomize direction selection
        return shuffleArray(targets);
    };

    // keep targeting close spots:
    const extendTargeting = (x, y) => {
        // determine the direction we're currently attacking in
        if (lastHit && potentialTargets.length > 0) {
            const lastTarget = potentialTargets[0];
            const dx = x - lastHit.x;
            const dy = y - lastHit.y;
            
            // continue in the same direction
            const nextX = x + dx;
            const nextY = y + dy;
            
            if (isValidAttack(nextX, nextY)) {
                potentialTargets.unshift({ x: nextX, y: nextY });
            }
        }
    };

    // we're hitting water, change direction
    const changeTargetingDirection = () => {
        if (potentialTargets.length > 0) {
            potentialTargets.shift(); // Remove failed direction
        }
        
        // if we still have potential targets, continue with the next one
        if (potentialTargets.length > 0) {
            return; // continue with remaining directions
        }
        
        // if we're out of directions but still have a last hit, 
        // generate new directions around the original hit
        if (lastHit && !huntMode) {
            potentialTargets = generateSurroundingTargets(lastHit.x, lastHit.y);
            
            // if we found new targets, continue targeting
            if (potentialTargets.length > 0) {
                return;
            }
        }
        
        // only go back to hunting if we truly have no more options
        huntMode = true;
        lastHit = null;
    };

    // shuffle array algorithm for better organizing of directions:
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const player = {
        name,
        gameboard,
        isTurn: false, // start with no one's turn, it's handled on game logic
        CPU,
    };

    if (CPU) {
        player.generateAttack = generateAttack;
        player.recordAttackResult = recordAttackResult; // smart AI
    }

    return player;
};


module.exports =  { createPlayer };