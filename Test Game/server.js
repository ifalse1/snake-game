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
        y: 0,
    };

    socket.on('disconnect', () => {
        console.log('A client disconnected');
        delete players[socket.id];
    });

    socket.on('initialPosition', (data) => {
        // Broadcast initial position to all clients except the sender
        players[socket.id] = { x: data.x, y: data.y};
        io.emit('playerConnected', players[socket.id]);
    });

    socket.on('move', (data) => {
        // Broadcast player movement to all clients except the sender
        socket.broadcast.emit('playerMove', { playerId: socket.id, x: data.x, y: data.y });
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
