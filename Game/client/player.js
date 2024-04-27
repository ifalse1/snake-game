class Segment {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.imgSegment = new Image();
        this.imgSegment.src = './Assets/segment.png';
    }

    setPosition(positions) {
        this.x = positions.x;
        this.y = positions.y;
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.drawImage(this.imgSegment, -20, -20, 40, 40); // Adjust size as needed
        ctx.restore();
    }
}

class Tail {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.imgSegment = new Image();
        this.imgSegment.src = './Assets/tail.png';
    }

    setPosition(positions) {
        this.x = positions.x;
        this.y = positions.y;
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.drawImage(this.imgSegment, -20, -20, 40, 40); // Adjust size as needed
        ctx.restore();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 2; // Random size between 2 and 7
        this.lifeSpan = Math.random() * 30 + 20; // Random lifespan
        this.velX = Math.random() * 4 - 2; // Random velocity
        this.velY = Math.random() * 4 - 2;

        this.imgParticle = new Image();
        this.imgParticle.src = './Assets/particle.png';
    }

    update() {
        //console.log("updating")
        this.x += this.velX;
        this.y += this.velY;
        this.lifeSpan--;
    }

    draw(ctx, camera) {
        if (!this.imgParticle.complete) {
            return; // Ensure the image is loaded before drawing
        }
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.drawImage(this.imgParticle, -this.size / 2, -this.size / 2, this.size, this.size); // Center the image at the particle's position
        ctx.restore();
    }

    isDead() {
        return this.lifeSpan <= 0;
    }
}


class Player {
    constructor(x, y, world) {
        this.particles = [];
        this.world = world;
        this.direction = { x: 0, y: -5 };
        this.head = { x: x, y: y};
        this.segments = [];
        this.startingSegments = 5;
        this.movementQueue = [];
        this.sequenceNumber = 0;

        this.name = '';
        this.score = 0;

        this.foodEaten = 0;
        this.foodIncrease = 10;

        this.isDead = false;

        this.imgHead = new Image();
        this.imgHead.src = './Assets/head.png'

        for (let i = 0; i < this.startingSegments; i++) {
            this.segments.push(new Segment(x, y));
        }

        this.lastSegment = this.segments[this.segments.length - 1];
        this.tail = new Tail(this.lastSegment.x, this.lastSegment.y);

        this.eatSound = new Audio('./Assets/eating_sound.mp3');

        //this.invincibilty
    }

    generateParticles(count, x, y) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });
    }

    drawParticles(ctx, camera) {
        this.particles.forEach(particle => particle.draw(ctx, camera));
    }

    setName(name, socket) {
        this.name = name;
        // Initialize name
        socket.emit('updateName', this.name);
    }

    setSegments(newSegments) {
        if (newSegments.length <= this.segments.length) {
            for (let i = 0; i < newSegments.length; i++) {
                //console.log(i);
                this.segments[i].setPosition({ x: newSegments[i].x, y: newSegments[i].y });
            }
        }
    }

    update() {
        let lastSegment = this.segments[this.segments.length - 1];
        this.tail.x = lastSegment.x;
        this.tail.y = lastSegment.y;

        const newHeadX = this.head.x + this.direction.x;
        const newHeadY = this.head.y + this.direction.y;

        if (this.isInsideBorder(newHeadX, newHeadY)) {
            // Adds head position to movement queue for segments
            if (this.sequenceNumber % 2 == 0) {
                this.movementQueue.unshift({x: this.head.x, y: this.head.y}); // Add current head position to history
            }

            this.head.x = newHeadX;
            this.head.y = newHeadY;

            // Update segment positions
            this.segments.forEach((segment, index) => {
                let movementIndex = (index + 1) * 2; // Shifts segments and provides space
                if (this.movementQueue[movementIndex]) { // Check if there's a history position for this segment
                    const currPos = this.movementQueue[movementIndex];
                    const prevPos = this.movementQueue[movementIndex - 1] || currPos; // Use current position if no previous position
                    // Interpolate segment position
                    segment.x = prevPos.x + (currPos.x - prevPos.x) * 0.5; // Linear interpolation with factor 0.5
                    segment.y = prevPos.y + (currPos.y - prevPos.y) * 0.5;
                }
            });

            if (this.movementQueue.length > this.segments.length * 2) {
                this.movementQueue.pop(); // Remove the oldest position not needed anymore
            }

            this.updateParticles();

            this.sequenceNumber++;
            //console.log(this.sequenceNumber);
        } else {
            this.isDead = true;
            this.segments = [];
        }
    }

    checkFoodCollision(food, socket) {
        // Define the collision region around the player's head
        const headCollisionRadius = 25; // Adjust as needed
    
        // Iterate through food items
        for (let i = 0; i < food.length; i++) {
            const foodItem = food[i];
            // Calculate the distance between the center of the player's head and the center of the food item
            const distance = Math.sqrt(Math.pow(this.head.x - foodItem.x, 2) + Math.pow(this.head.y - foodItem.y, 2));
            // Check if the distance is less than the sum of the radii of the player's head collision region and the food item
            if (distance < headCollisionRadius + foodItem.size) {
                this.score++;
                // Remove the eaten food item
                food.splice(i, 1);
    
                // Generate particles
                this.generateParticles(5, foodItem.x, foodItem.y);  // Generate 10 particles at the location of the food
    
                // Increment the number of food items eaten
                this.foodEaten++;

                this.eatSound.play();

                // Check if it's time to increase segments
                if (this.foodEaten % this.foodIncrease === 0) {
                    // Increase segments
                    this.addSegments(1); // Increase by 1 segment
                }
                // Emit update to the server
                socket.emit('updateFood', food);
                socket.emit('updateScore', this.score);
                break; // Exit loop after collision with one food item
            }
        }
    }
    

    addSegments(count) {
        // Add 'count' segments to the player
        for (let i = 0; i < count; i++) {
            // Add a new segment at the current tail position
            const lastSegment = this.segments[this.segments.length - 1];
            this.segments.push(new Segment(lastSegment.x, lastSegment.y));
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
        if (!this.isDead) {
            this.segments.forEach(segment => segment.draw(ctx, camera));
            //console.log(this.segments[0].draw());
            this.tail.draw(ctx, camera);
            this.drawParticles(ctx, camera);

            let angle = Math.atan2(this.direction.y, this.direction.x) - Math.PI/2;
            ctx.save();
            ctx.translate(this.head.x - camera.x, this.head.y - camera.y);
            ctx.rotate(angle);
            ctx.drawImage(this.imgHead, -25, -25, 50, 50); // Center the image
            ctx.restore();

            ctx.fillStyle = 'red'; // Text color
            ctx.font = '14px Arial'; // Font size and type
            ctx.textAlign = 'center'; // Center the text over the x position
            ctx.fillText(this.name, this.head.x - camera.x, this.head.y - camera.y + 40); // Adjust position as needed
        }
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
