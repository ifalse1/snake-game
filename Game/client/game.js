import Player from './player.js';
import { Helper } from './helper.js';

const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './Assets/background.jpg';

const world = { height: 3239, width: 5759, border: 5};

let players = {};

const SPEED = 5;
const interpolationFactor = 0.5;

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

let playerX = Helper.randomInt(world.border / 2, world.width - world.border / 2);
let playerY = Helper.randomInt(world.border / 2, world.height - world.border / 2);

let localPlayer = new Player(playerX, playerY, world);

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
            players[id].prevX = players[id].head.x;
            players[id].prevY = players[id].head.y;
            players[id].head.x = serverPlayer.x;
            players[id].head.y = serverPlayer.y;
            players[id].movingDirection = serverPlayer.movingDirection;
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
        let player = players[id];
        let interpX = player.prevX + (player.head.x - player.prevX) * interpolationFactor;
        let interpY = player.prevY + (player.head.y - player.prevY) * interpolationFactor;
        player.drawPlayer(ctx, camera, interpX, interpY);
    }
}


const keys = {
    up: {
        pressed: false
    },
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    down: {
        pressed: false
    }
}

setInterval(() => {
    if (keys.up.pressed) {
        localPlayer.movingDirection = { x: 0, y: 0 };
        if (localPlayer.movingDirection.y > -SPEED) {
            localPlayer.movingDirection.y += -SPEED;
        }
        socket.emit('keyInput', { keycode: 'up', sequenceNumber: localPlayer.getInputs() });
    }
    if (keys.down.pressed) {
        localPlayer.movingDirection = { x: 0, y: 0 };
        if (localPlayer.movingDirection.y < SPEED) {
            localPlayer.movingDirection.y += SPEED;
        }
        socket.emit('keyInput', { keycode: 'down', sequenceNumber: localPlayer.getInputs() });
    }
    if (keys.left.pressed) {
        localPlayer.movingDirection = { x: 0, y: 0 };
        if (localPlayer.movingDirection.x > -SPEED) {
            localPlayer.movingDirection.x += -SPEED;
        }
        socket.emit('keyInput', { keycode: 'left', sequenceNumber: localPlayer.getInputs() });
        socket.emit('changeSequence')
    }
    if (keys.right.pressed) {
        localPlayer.movingDirection = { x: 0, y: 0 };
        if (localPlayer.movingDirection.x < SPEED) {
            localPlayer.movingDirection.x += SPEED;
        }
        socket.emit('keyInput', { keycode: 'right', sequenceNumber: localPlayer.getInputs() });
    }
}, 50)

function userInput() {
    window.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'ArrowUp':
                keys.up.pressed = true;
                break;
            case 'ArrowDown':
                keys.down.pressed = true;
                break;
            case 'ArrowLeft':
                keys.left.pressed = true;
                break;
            case 'ArrowRight':
                keys.right.pressed = true;
                break;
        }
    });

    window.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                keys.up.pressed = false;
                break;
            case 'ArrowDown':
                keys.down.pressed = false;
                break;
            case 'ArrowLeft':
                keys.left.pressed = false;
                break;
            case 'ArrowRight':
                keys.right.pressed = false;
                break;
        }
    })
}

setInterval(() => {
    localPlayer.update();
}, 50)

function update() {
    //localPlayer.update();
    updateCamera();
    userInput();
}

function gameLoop() {
    update();
    render();

    requestAnimationFrame(gameLoop);
}

gameLoop();
