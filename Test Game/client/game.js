import Player from './player.js';
import InputHandler from './inputHandler.js';

const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './Assets/background.jpg';

const worldHeight = 3239;
const worldWidth = 5759;
const borderWidth = 5;

let players = {};

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

let initialPosition = { x: randomInt(borderWidth / 2, worldWidth - borderWidth / 2), y: randomInt(borderWidth / 2, worldHeight - borderWidth / 2)};

socket.emit('initialPosition', initialPosition);
socket.on('playerConnected', (player) => {
    players[player] = player;
})

const player = new Player(
    initialPosition,
    borderWidth, worldWidth, worldHeight
);

const inputHandler = new InputHandler(player, socket);

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateCamera(player) {
    camera.x = Math.max(0, Math.min(player.snake.x - camera.width / 2, worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(player.snake.y - camera.height / 2, worldHeight - camera.height));
}

function drawSnakePart(player) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(player.snake.x - camera.x, player.snake.y - camera.y, 10, 10);
    ctx.strokeRect(player.snake.x - camera.x, player.snake.y - camera.y, 10, 10);
}

function drawBorder() {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2 - camera.x, borderWidth / 2 - camera.y, worldWidth - borderWidth, worldHeight - borderWidth);
}

function renderPlayers() {
    Object.values(players).forEach(player => {
        ctx.fillStyle = 'blue';
        console.log(player);
        ctx.fillRect(player.x, player.y, 10, 10);
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, -camera.x, -camera.y, worldWidth, worldHeight);
    drawBorder();
    drawSnakePart(player);
    //renderPlayers();
}

function update() {
    player.update();
}

function gameLoop() {
    update();
    updateCamera(player);
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
