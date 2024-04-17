const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './Assets/background.jpg'; // Load the background image

let worldHeight = 3239;
let worldWidth = 5759;
const borderWidth = 5; // Thickness of the border

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// Function to generate a random integer within a range
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random coordinates for snake's initial position
const snakeInitialX = randomInt(borderWidth / 2, worldWidth - borderWidth / 2);
const snakeInitialY = randomInt(borderWidth / 2, worldHeight - borderWidth / 2);

const snake = [{x: snakeInitialX, y: snakeInitialY}];

function drawSnakePart(snakePart) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(snakePart.x - camera.x, snakePart.y - camera.y, 10, 10);
    ctx.strokeRect(snakePart.x - camera.x, snakePart.y - camera.y, 10, 10);
}

function drawBorder() {
    ctx.strokeStyle = 'red'; // Set border color
    ctx.lineWidth = borderWidth; // Set border width
    ctx.strokeRect(borderWidth / 2 - camera.x, borderWidth / 2 - camera.y, worldWidth - borderWidth, worldHeight - borderWidth); // Draw border
}

function updateCamera() {
    camera.x = Math.max(0, Math.min(snake[0].x - camera.width / 2, worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(snake[0].y - camera.height / 2, worldHeight - camera.height));
}

function isInsideBorder(x, y) {
    return x >= borderWidth / 2 && y >= borderWidth / 2 && x <= worldWidth - borderWidth / 2 && y <= worldHeight - borderWidth / 2;
}

function update() {
    const newHeadX = snake[0].x;
    const newHeadY = snake[0].y;

    if (isInsideBorder(newHeadX, newHeadY)) {
        const head = { x: newHeadX, y: newHeadY };
        snake.unshift(head);
        snake.pop();
    }
    updateCamera();
}

socket.on('move', function(data) {
    if (isInsideBorder(data.x, data.y)) {
        snake[0].x = data.x;
        snake[0].y = data.y;
    }
});

document.addEventListener('keydown', function(event) {
    const movingDirection = { x: 0, y: 0 };
    if (event.key === "ArrowUp") movingDirection.y = -10;
    if (event.key === "ArrowDown") movingDirection.y = 10;
    if (event.key === "ArrowLeft") movingDirection.x = -10;
    if (event.key === "ArrowRight") movingDirection.x = 10;
    
    const newHeadX = snake[0].x + movingDirection.x;
    const newHeadY = snake[0].y + movingDirection.y;

    if (isInsideBorder(newHeadX, newHeadY)) {
        socket.emit('move', { x: newHeadX, y: newHeadY });
    }
});

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, -camera.x, -camera.y, worldWidth, worldHeight);
    drawBorder(); // Draw border
    snake.forEach(drawSnakePart);
}

function gameLoop() {

    update();
    render();

    requestAnimationFrame(gameLoop);
}

gameLoop();
