class Segment {
    constructor() {
        this.movementQueue = [];
        this.x;
        this.y;
    }

    draw(ctx, camera) {
        
    }

    update() {

    }

}

class Player {
    constructor(x, y, world) {
        this.world = world;
        this.direction = { x: 0, y: -5 };
        this.head = { x: x, y: y};
        this.segments = [];
        this.tail = {};
        this.startingSegments = 3;

        this.sequenceNumber = 0;
        this.playerInputs = [];

        this.imgHead = new Image();
        this.imgHead.src = './Assets/head.png'

        for (let i = 0; i < this.startingSegments; i++) {
            let segment = new Segment()
            this.segments.push(segment);
        }

        console.log(this.segments);

        //this.invincibilty
    }

    update() {
        // Calculate new head position based on the moving direction
        const newHeadX = this.head.x + this.direction.x;
        const newHeadY = this.head.y + this.direction.y;

        // Check if the new head position is inside the border
        if (this.isInsideBorder(newHeadX, newHeadY)) {
            //this.sequenceNumber++;

            this.head.x = newHeadX;
            this.head.y = newHeadY;

            //console.log(this.movingDirection);
            //this.playerInputs.push({ sequenceNumber: this.sequenceNumber, movement: this.movingDirection});
            //console.log(`${this.head.x}/${this.head.y} : ${Date.now()}`)
            //console.log(this.playerInputs[this.playerInputs.length - 1].sequenceNumber);
        }
    }

    rotate(degrees) {
        const radians = (Math.PI / 180) * degrees;
        const newX = this.direction.x * Math.cos(radians) - this.direction.y * Math.sin(radians);
        const newY = this.direction.x * Math.sin(radians) + this.direction.y * Math.cos(radians);
        this.direction.x = Math.round(newX);
        this.direction.y = Math.round(newY);
    }

    getInputs() {
        return this.playerInputs;
    }

    spliceInputs(spliceIndex) {
        this.playerInputs.splice(0, spliceIndex);
    }

    drawPlayer(ctx, camera) {
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
