class Player {
    constructor(initialPosition, borderWidth, worldWidth, worldHeight) {
        this.snake = initialPosition;
        this.borderWidth = borderWidth;
        this.worldWidth = worldWidth
        this.worldHeight = worldHeight;
        this.movingDirection = { x: 0, y: 0 };
    }

    update() {
        // Calculate new head position based on the moving direction
        const newHeadX = this.snake.x + this.movingDirection.x;
        const newHeadY = this.snake.y + this.movingDirection.y;

        // Check if the new head position is inside the border
        if (this.isInsideBorder(newHeadX, newHeadY)) {
            this.snake.x = newHeadX;
            this.snake.y = newHeadY;
        }
    }

    setMovingDirection(direction) {
        this.movingDirection = direction;
    }

    isInsideBorder(x, y) {
        return (
            x >= this.borderWidth / 2 &&
            y >= this.borderWidth / 2 &&
            x <= this.worldWidth - this.borderWidth / 2 &&
            y <= this.worldHeight - this.borderWidth / 2
        );
    }
}

export default Player;
