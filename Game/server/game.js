const socketIO = require('socket.io');

class Game {
    constructor(server) {
        this.world = { height: 3239, width: 5759, border: 5};
        this.players = {};
        this.io = socketIO(server);
        this.lastUpdate = Date.now();
        this.updateInterval = 15;
        this.SPEED = 5;
    }
    
    socketResponses() {
        // Handle socket connections
        this.io.on('connection', (socket) => {
            console.log('A client connected');

            socket.emit('setLocalPlayer', socket.id);

            this.players[socket.id] = {
                x: 0,
                y: 0,
                movingDirection: { x: 0, y: -this.SPEED },
                sequenceNumber: 0
            };

            socket.on('disconnect', () => {
                console.log('A client disconnected');
                delete this.players[socket.id];
                this.io.emit('updatePlayers', this.players);
            });

            socket.on('keyInput', ({ keycode }) => {
                if (Date.now() - this.lastUpdate >= this.updateInterval) {
                    switch (keycode) {
                        case 'up':
                            this.players[socket.id].movingDirection = { x: 0, y: 0 };
                            if (this.players[socket.id].movingDirection.y >= -this.SPEED) {
                                this.players[socket.id].movingDirection.y += -this.SPEED;
                            }
                            break;
                        case 'down':
                            this.players[socket.id].movingDirection = { x: 0, y: 0 };
                            if (this.players[socket.id].movingDirection.y <= this.SPEED) {
                                this.players[socket.id].movingDirection.y += this.SPEED;
                            }
                            break;
                        case 'left':
                            this.players[socket.id].movingDirection = { x: 0, y: 0 };
                            if (this.players[socket.id].movingDirection.x >= -this.SPEED) {
                                this.players[socket.id].movingDirection.x += -this.SPEED;
                            }
                            break;
                        case 'right':
                            this.players[socket.id].movingDirection = { x: 0, y: 0 };
                            if (this.players[socket.id].movingDirection.x <= this.SPEED) {
                                this.players[socket.id].movingDirection.x += this.SPEED;
                            }
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
        const newHeadX = player.x + player.movingDirection.x;
        const newHeadY = player.y + player.movingDirection.y;

        // Check if the new head position is inside the border
        if (this.isInsideBorder(newHeadX, newHeadY)) {
            player.x = newHeadX;
            player.y = newHeadY;
            player.sequenceNumber++;
        }
    }

    gameLoop() {
        for (let id in this.players) {
            if (this.players[id].movingDirection) {
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