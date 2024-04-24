// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

const players = {};

const world = { height: 3239, width: 5759, border: 5};

// Serve static files from the public directory
app.use(express.static(path.join(__dirname)));

// Define route handler for the root URL
app.get('/', (req, res) => {
    // Send a basic HTML file as the response
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Handle socket connections
io.on('connection', (socket) => {
    console.log('A client connected');

    players[socket.id] = {
        x: 0,
        y: 0
    };

    socket.on('initialPosition', (data) => {
        // Broadcast initial position to all clients except the sender
        players[socket.id] = { x: data.x, y: data.y};
        io.emit('updatePlayers', players);
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected');
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });

    socket.on('move', (data) => {
        // Broadcast player movement to all clients except the sender
        // TODO: Update this
        players[socket.id] = { x: data.x, y: data.y };
    });

    setInterval(() => {
        io.emit('updatePlayers', players);
    }, 15);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
