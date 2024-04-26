const socketIO = require('socket.io');

class Game {
    constructor(server) {
        this.world = { height: 3239, width: 5759, border: 5};
        this.players = {};
        this.io = socketIO(server);
        this.lastUpdate = Date.now();
        this.updateInterval = 15;
    }
    
    socketResponses() {
        // Handle socket connections
        this.io.on('connection', (socket) => {
            console.log('A client connected');

            socket.emit('setLocalPlayer', socket.id);

            this.players[socket.id] = {
                x: 0,
                y: 0,
                direction: { x: 0, y: -5 },
                sequenceNumber: 0,
            };

            socket.on('disconnect', () => {
                console.log('A client disconnected');
                delete this.players[socket.id];
                this.io.emit('updatePlayers', this.players);
            });

            socket.on('keyInput', (keycode) => {
                if (Date.now() - this.lastUpdate >= this.updateInterval) {
                    switch (keycode) {
                        case 'left':
                            this.rotate(this.players[socket.id], 90);
                            break;
                        case 'right':
                            this.rotate(this.players[socket.id], -90);
                            break;
                    }
                }

                // Update last update timestamp
                this.lastUpdate = Date.now();
            })

            socket.on('initialPosition', (data) => {
                // Broadcast player movement to all clients except the sender
                // TODO: Update this
                this.players[socket.id].x = data.x;
                this.players[socket.id].y = data.y;
            });
        });
    }

    isInsideBorder(x, y) {
        return (
            x < this.world.width - 15 &&
            y < this.world.height - 15 &&
            x > this.world.border &&
            y > this.world.border
        );
    }

    update(player) {
        // Calculate new head position based on the moving direction
        const newHeadX = player.x + player.direction.x;
        const newHeadY = player.y + player.direction.y;

        // Check if the new head position is inside the border
        if (this.isInsideBorder(newHeadX, newHeadY)) {
            player.x = newHeadX;
            player.y = newHeadY;
            //player.sequenceNumber++;
            //console.log(player.sequenceNumber);
        }
    }

    rotate(player, degrees) {
        const radians = (Math.PI / 180) * degrees;
        const newX = player.direction.x * Math.cos(radians) - player.direction.y * Math.sin(radians);
        const newY = player.direction.x * Math.sin(radians) + player.direction.y * Math.cos(radians);
        player.direction.x = Math.round(newX);
        player.direction.y = Math.round(newY);
    }

    gameLoop() {
        for (let id in this.players) {
            if (this.players[id].direction) {
                this.update(this.players[id]);
            }
        }
        setTimeout(() => {
            //console.log(this.players);
            this.io.emit('updatePlayers', this.players);
            this.gameLoop();
        }, this.updateInterval);
    }

    initialize(httpServer) {
        this.socketResponses(httpServer);
        this.gameLoop();
    }
}

module.exports = Game;