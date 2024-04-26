const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

let Game = require('./server/game.js');
let game = new Game(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname)));

// Define route handler for the root URL
app.get('/', (req, res) => {
    // Send a basic HTML file as the response
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
server.listen(PORT, function() {
    console.log(`Server is running on http://localhost:${PORT}`);
    game.initialize(server);
});