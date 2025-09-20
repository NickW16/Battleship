import "./styles.css";
const { manageDOM } = require('./dom-management');
const { ship, shipTypes } = require('./ship');

// it won't run without this line:
document.addEventListener('DOMContentLoaded', manageDOM);