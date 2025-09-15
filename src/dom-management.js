const manageDOM = () => {
    const divTest = document.createElement('div');
    divTest.id = 'test';
    divTest.textContent = 'Battleship Game Test';
    document.body.appendChild(divTest);
};

module.exports = { manageDOM };

// it won't run without this line:
document.addEventListener('DOMContentLoaded', manageDOM);
