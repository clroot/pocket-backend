/* eslint-disable no-global-assign */

require = require('esm')(module);
const app = require('./main.js');

app.startServer();
module.exports = app;
