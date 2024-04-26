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

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

let playerX = Helper.randomInt(world.border / 2, world.width - world.border / 2);
let playerY = Helper.randomInt(world.border / 2, world.height - world.border / 2);

let localPlayer = new Player(playerX, playerY, world);

let inputHandler = new InputHandler({ left: 'ArrowLeft', right: 'ArrowRight' }, localPlayer, socket);

socket.on('setLocalPlayer', (id) => {
    players[id] = localPlayer;
});

// Sets initial position
socket.emit('initialPosition', localPlayer.head);

socket.on('updatePlayers', (serverPlayers) => {
    for (let id in serverPlayers) {
        let serverPlayer = serverPlayers[id];

        if (!players[id]) {
            players[id] = new Player(serverPlayer.x, serverPlayer.y, world);
            //console.log(players[id].head.x);
        } else {
            players[id].head.x = serverPlayer.x;
            players[id].head.y = serverPlayer.y;
            players[id].direction = serverPlayer.direction;
        }
    }

    // Removes disconnected players
    for (let id in players) {
        if (!serverPlayers[id]) {
            delete players[id];
        }
    }
})

// Sets the camera over the middle of the player
function updateCamera() {
    //console.log(localPlayer.head);
    camera.x = Math.max(0, Math.min(localPlayer.head.x - camera.width / 2, world.width - camera.width));
    camera.y = Math.max(0, Math.min(localPlayer.head.y - camera.height / 2, world.height - camera.height));
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
    for (let id in players) {
        players[id].drawPlayer(ctx, camera);
    }
}

setInterval(() => {
    localPlayer.update();
}, 15)

function update() {
    //localPlayer.update();
    updateCamera();
    inputHandler.userInput();
}

function gameLoop() {
    update();
    render();

    requestAnimationFrame(gameLoop);
}

gameLoop();
