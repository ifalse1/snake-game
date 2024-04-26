class Segment {
    constructor() {
        this.movementQueue = [];
    }

    draw(ctx, camera) {
        
    }

}

class Player {
    constructor(x, y, world) {
        this.world = world;
        this.movingDirection = { x: 0, y: 0 };
        this.head = { x: x, y: y};
        this.segments = [];
        this.tail = {};

        this.sequenceNumber = 0;
        this.playerInputs = [];

        this.prevX = this.x;
        this.prevY = this.y;
        //this.invincibilty
    }

    update() {
        // Calculate new head position based on the moving direction
        const newHeadX = this.head.x + this.movingDirection.x;
        const newHeadY = this.head.y + this.movingDirection.y;

        // Check if the new head position is inside the border
        if (this.isInsideBorder(newHeadX, newHeadY)) {
            this.sequenceNumber++;

            this.head.x = newHeadX;
            this.head.y = newHeadY;

            //console.log(this.movingDirection);
            this.playerInputs.push({ sequenceNumber: this.sequenceNumber, movement: this.movingDirection});
            //console.log(`${this.head.x}/${this.head.y} : ${Date.now()}`)
            //console.log(this.playerInputs[this.playerInputs.length - 1].sequenceNumber);
        }
    }

    getInputs() {
        return this.playerInputs;
    }

    spliceInputs(spliceIndex) {
        this.playerInputs.splice(0, spliceIndex);
    }

    drawPlayer(ctx, camera, interpX, interpY) {
        // Calculate the position relative to the camera
        let screenX = interpX - camera.x;
        let screenY = interpY - camera.y;

        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(this.head.x - camera.x, this.head.y - camera.y, 10, 10);
        ctx.strokeRect(this.head.x - camera.x, this.head.y - camera.y, 10, 10);
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
