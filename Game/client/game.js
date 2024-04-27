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

let food = [];

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

let playerX = Helper.randomInt(world.border / 2, world.width - world.border / 2);
let playerY = Helper.randomInt(world.border / 2, world.height - world.border / 2);

let localPlayer = new Player(playerX, playerY, world);

//TODO: Causes bugs, not sure the solution yet

// Retrieve controls from local storage or use default values
//const leftControl = localStorage.getItem('leftControl') || 'ArrowLeft';
//const rightControl = localStorage.getItem('rightControl') || 'ArrowRight';

// Initialize input handler with controls
//let inputHandler = new InputHandler({ left: leftControl, right: rightControl }, localPlayer, socket);

let inputHandler = new InputHandler({ left: 'ArrowLeft', right: 'ArrowRight' }, localPlayer, socket);

let playerName = '';

function startGame() {
    // Retrieve player name
    playerName = document.getElementById('nameInput').value;

    localPlayer.setName(playerName, socket);

    // Hide overlay
    document.getElementById('overlay').style.display = 'none';
    gameLoop();
}

document.getElementById('startButton').addEventListener('click', startGame);

socket.on('setLocalPlayer', (id) => {
    players[id] = localPlayer;
});

// Initialize position
socket.emit('initialPosition', localPlayer);

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
            players[id].tail.setPosition({ x: serverPlayer.tail.x, y: serverPlayer.tail.y });
            players[id].setSegments(serverPlayer.segments)
            if (serverPlayer.name) {
                players[id].name = serverPlayer.name;
            }
            players[id].score = serverPlayer.score;
            console.log(serverPlayer.score);
        }
    }

    // Removes disconnected players
    for (let id in players) {
        if (!serverPlayers[id]) {
            delete players[id];
        }
    }
})

socket.on('updateFood', (serverFood) =>{
    food = serverFood;
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

function drawFood() {
    let currentTime = Date.now();
    ctx.fillStyle = 'green'; // Set the color for food
    for (let i = 0; i < food.length; i++) {
        let foodItem = food[i];
        // Calculate the remaining lifespan of the food item
        let lifespanRemaining = foodItem.lifespan - (currentTime - foodItem.timestamp);
        if (lifespanRemaining > 0) {
            // Draw the food item only if it's still within its lifespan
            ctx.beginPath();
            ctx.arc(foodItem.x - camera.x, foodItem.y - camera.y, foodItem.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Draw player scores in the top right corner of the canvas
function drawPlayerScores() {
    ctx.fillStyle = 'black'; // Set text color
    ctx.font = '20px Arial'; // Set font size and type
    ctx.textAlign = 'right'; // Align text to the right
    ctx.fillText('Top 5 Scores:', canvas.width - 10, 30); // Position the label

    // Sort players by score
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score).slice(0, 5);

    // Loop through sorted player scores and draw them
    let yOffset = 60; // Initial vertical position
    sortedPlayers.forEach(player => {
        let playerName = player.name || 'Anonymous'; // Get player name
        let score = player.score;
        ctx.fillText(`${playerName}: ${score}`, canvas.width - 10, yOffset);
        yOffset += 30; // Increase vertical position for the next score
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, -camera.x, -camera.y, world.width, world.height);
    drawBorder();
    drawFood();
    for (let id in players) {
        players[id].drawPlayer(ctx, camera);
    }
    drawPlayerScores(); // Draw player scores
}

setInterval(() => {
    if (!localPlayer.isDead) {
        localPlayer.update();
        localPlayer.checkFoodCollision(food, socket);
        socket.emit('updateSegments', localPlayer.segments.map(segment => ({ x: segment.x, y: segment.y })));
    } else {
        // localPlayer.segments.forEach(segment => {
        //     food.push({ x: segment.x, y: segment.y, size: 10, lifespan: 30000, timestamp: Date.now() });
        // })
        // food.push({ x: localPlayer.head.x, y: localPlayer.head.y, size: 10, lifespan: 30000, timestamp: Date.now() });
        socket.emit('playerDeath')
    }
}, 20)

function update() {
    //localPlayer.update();
    updateCamera();
    inputHandler.userInput();
}

function gameLoop() {
    if (!localPlayer.isDead) {
        update();
        render();
        requestAnimationFrame(gameLoop);
    } else {
         // Create a modal dialog box
         const modal = document.createElement('div');
         modal.className = 'modal';
         
         // Create content for the modal
         const content = document.createElement('div');
         content.className = 'modal-content';
         const scoreText = document.createTextNode(`Your Score: ${localPlayer.score}`);
         content.appendChild(scoreText);
         
         // Create a button to return to the menu
         const menuButton = document.createElement('button');
         menuButton.textContent = 'Return to Menu';
         menuButton.addEventListener('click', () => {
             // Redirect to menu.html
             window.location.href = 'index.html';
         });
         content.appendChild(menuButton);
         
         modal.appendChild(content);
         document.body.appendChild(modal);
    }
}