import "./styles.css";
const { manageDOM } = require('./dom-management');
const { ship } = require('./ship');

// it won't run without this line:
document.addEventListener('DOMContentLoaded', manageDOM);