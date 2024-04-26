class Segment {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.imgSegment = new Image();
        this.imgSegment.src = './Assets/segment.png';
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.drawImage(this.imgSegment, -20, -20, 40, 40); // Adjust size as needed
        ctx.restore();
    }
}

class Player {
    constructor(x, y, world) {
        this.world = world;
        this.direction = { x: 0, y: -5 };
        this.head = { x: x, y: y};
        this.segments = [];
        this.tail = {};
        this.startingSegments = 5;
        this.movementQueue = [];
        this.sequenceNumber = 0;

        this.imgHead = new Image();
        this.imgHead.src = './Assets/head.png'

        for (let i = 0; i < this.startingSegments; i++) {
            this.segments.push(new Segment(x, y));
        }

        //this.invincibilty
    }

    update() {
        const newHeadX = this.head.x + this.direction.x;
        const newHeadY = this.head.y + this.direction.y;

        if (this.isInsideBorder(newHeadX, newHeadY)) {
            // Adds head position to movement queue for segments
            if (this.sequenceNumber % 3 == 0) {
                this.movementQueue.unshift({x: this.head.x, y: this.head.y}); // Add current head position to history
            }

            this.head.x = newHeadX;
            this.head.y = newHeadY;

            // Update segment positions
            this.segments.forEach((segment, index) => {
                let movementIndex = (index + 1) * 3; // Shifts segments and provides space
                if (this.movementQueue[movementIndex]) { // Check if there's a history position for this segment
                    segment.x = this.movementQueue[movementIndex].x;
                    segment.y = this.movementQueue[movementIndex].y;
                }
            });

            if (this.movementQueue.length > this.segments.length * 3) {
                this.movementQueue.pop(); // Remove the oldest position not needed anymore
            }

            this.sequenceNumber++;
        }
    }

    rotate(degrees) {
        const radians = (Math.PI / 180) * degrees;
        const newX = this.direction.x * Math.cos(radians) - this.direction.y * Math.sin(radians);
        const newY = this.direction.x * Math.sin(radians) + this.direction.y * Math.cos(radians);
        this.direction.x = Math.round(newX);
        this.direction.y = Math.round(newY);
    }

    drawPlayer(ctx, camera) {
        this.segments.forEach(segment => segment.draw(ctx, camera));

        const angle = Math.atan2(this.direction.y, this.direction.x) - Math.PI/2;
        ctx.save();
        ctx.translate(this.head.x - camera.x, this.head.y - camera.y);
        ctx.rotate(angle);
        ctx.drawImage(this.imgHead, -25, -25, 50, 50); // Center the image
        ctx.restore();
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
