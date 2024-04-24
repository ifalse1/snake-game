import { Helper } from './helper.js';

class Player {
    constructor(x, y, world) {
        this.world = world;
        this.movingDirection = { x: 0, y: 0 };
        this.snake = { x: x, y: y};
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

    getPosition() {
        return this.snake;
    }

    setMovingDirection(direction) {
        this.movingDirection = direction;
    }

    isInsideBorder(x, y) {
        return (
            x < this.world.width - 15 &&
            y < this.world.height - 15 &&
            x > this.world.border &&
            y > this.world.border
        );
    }
}

export default Player;
