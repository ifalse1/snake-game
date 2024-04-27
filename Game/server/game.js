const socketIO = require('socket.io');

class Game {
    constructor(server) {
        this.world = { height: 3239, width: 5759, border: 5};
        this.players = {};
        this.food = [];
        this.io = socketIO(server);
        this.lastUpdate = Date.now();
        this.updateInterval = 15;
        this.maxFood = 500;
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
                segments: [],
                tail: { x: 0, y: 0 },
                movementQueue: [],
                name: '',
                score: 0
            };

            socket.on('disconnect', () => {
                console.log('A client disconnected');
                delete this.players[socket.id];
                this.io.emit('updatePlayers', this.players);
            });

            socket.on('updateScore', (newScore) => {
                this.players[socket.id].score = newScore;
            });

            socket.on('updateName', (name) => {
                if (name) {
                    this.players[socket.id].name = name;
                }
            })

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
            });

            socket.on('updateSegments', (segments) => {
                if (segments){
                    this.players[socket.id].segments = segments;
                }
                //console.log(this.players[socket.id]);
            });

            socket.on('initialPosition', (data) => {
                // Broadcast player movement to all clients except the sender
                // TODO: Update this
                this.players[socket.id].x = data.head.x;
                this.players[socket.id].y = data.head.y;
                this.players[socket.id].segments = data.segments;
                this.players[socket.id].name = data.name;
            });

            socket.on('updateFood', (food) => {
                this.food = food;
            })

            socket.on('playerDeath', () => {
                delete this.players[socket.id];
                this.io.emit('updatePlayers', this.players);
            });
        });
    }

    generateFood() {
        let minLifespan = 3000;
        let maxLifespan = 20000;
    
        // Remove expired food items
        let currentTime = Date.now();
        this.food = this.food.filter(foodItem => {
            return currentTime - foodItem.timestamp < foodItem.lifespan;
        });
    
        // Check if the current count of food items is below the maximum limit
        if (this.food.length < this.maxFood) {
            let foodCountToAdd = this.maxFood - this.food.length; // Calculate how many food items to add
            for (let i = 0; i < foodCountToAdd; i++) {
                // Generate new food items
                let foodX = Math.floor(Math.random() * (this.world.width - 2 * this.world.border)) + this.world.border;
                let foodY = Math.floor(Math.random() * (this.world.height - 2 * this.world.border)) + this.world.border;
                
                // Generate a random size for the food item (between 5 and 15, for example)
                let foodSize = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // Random size between 5 and 15

                let foodLifespan = Math.floor(Math.random() * (maxLifespan - minLifespan + 1)) + minLifespan;
                
                let foodItem = { x: foodX, y: foodY, size: foodSize, lifespan: foodLifespan, timestamp: Date.now() }; // Include the size and timestamp properties
                this.food.push(foodItem);
            }
        }
        // Emit food data to clients
        this.io.emit('updateFood', this.food);
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

            if (player.sequenceNumber % 2 == 0) {
                player.movementQueue.unshift({x: player.x, y: player.y}); // Add current head position to history
            }

            player.x = newHeadX;
            player.y = newHeadY;

            // Update segment positions
            player.segments.forEach((segment, index) => {
                let movementIndex = (index + 1) * 2; // Shifts segments and provides space
                if (player.movementQueue[movementIndex]) { // Check if there's a history position for this segment
                    let currPos = player.movementQueue[movementIndex];
                    let prevPos = player.movementQueue[movementIndex - 1] || currPos; // Use current position if no previous position
                    // Interpolate segment position
                    segment.x = prevPos.x + (currPos.x - prevPos.x) * 0.5; // Linear interpolation with factor 0.5
                    segment.y = prevPos.y + (currPos.y - prevPos.y) * 0.5;
                }
            });

            if (player.movementQueue.length > player.segments.length * 2) {
                player.movementQueue.pop(); // Remove the oldest position not needed anymore
            }

            player.sequenceNumber++;
    
            // Update tail position to follow the last segment
            let lastSegment = player.segments[player.segments.length - 1];
            player.tail.x = lastSegment.x;
            player.tail.y = lastSegment.y;

            //console.log(player);

            this.io.emit('updatePlayers', this.players);
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
            if (this.players[id].direction && this.players[id]) {
                this.update(this.players[id]);
            }
        }
        this.generateFood();
        setTimeout(() => {
            //console.log(this.players);
            this.gameLoop();
        }, this.updateInterval);
    }

    initialize(httpServer) {
        this.socketResponses(httpServer);
        this.gameLoop();
    }
}

module.exports = Game;