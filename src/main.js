import "./styles.css";
const { manageDOM } = require('./dom-management');

// it won't run without this line:
document.addEventListener('DOMContentLoaded', manageDOM);