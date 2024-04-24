import Player from './player.js';
import InputHandler from './inputHandler.js';
import { Helper } from './helper.js';

const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './Assets/background.jpg';

const world = { height: 3239, width: 5759, border: 5};

let players = {};

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

let playerX = Helper.randomInt(world.border / 2, world.width - world.border / 2);
let playerY = Helper.randomInt(world.border / 2, world.height - world.border / 2);

const player = new Player(playerX, playerY, world);
new InputHandler(player, socket);

socket.emit('initialPosition', player.getPosition());
socket.on('updatePlayers', (serverPlayers) => {
    for (const id in serverPlayers) {
        let serverPlayer = serverPlayers[id];

        if (!players[id]) {
            players[id] = new Player(serverPlayer.x, serverPlayer.y, world);
            //console.log(players[id].snake.x);
        } else {
            players[id].snake.x = serverPlayer.x;
            players[id].snake.y = serverPlayer.y;
        }
    }

    // Removes disconnected players
    for (const id in players) {
        if (!serverPlayers[id]) {
            delete players[id];
        }
    }
})

// Sets the camera over the middle of the player
function updateCamera(player) {
    camera.x = Math.max(0, Math.min(player.snake.x - camera.width / 2, world.width - camera.width));
    camera.y = Math.max(0, Math.min(player.snake.y - camera.height / 2, world.height - camera.height));
}

function drawPlayers() {
    for (let id in players) {
        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(players[id].snake.x - camera.x, players[id].snake.y - camera.y, 10, 10);
        ctx.strokeRect(players[id].snake.x - camera.x, players[id].snake.y - camera.y, 10, 10);
    }
}

function drawBorder() {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = world.border;
    ctx.strokeRect(world.border / 2 - camera.x, world.border / 2 - camera.y, world.width - world.border, world.height - world.border);
}


function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, -camera.x, -camera.y, world.width, world.height);
    drawBorder();
    drawPlayers();
}

function update() {
    player.update();
    socket.emit('move', { x: player.snake.x, y: player.snake.y });
}

function gameLoop() {
    update();
    updateCamera(player);
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
