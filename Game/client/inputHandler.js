class InputHandler {
    constructor(keybinds, player, socket) {
        this.left = keybinds.left;
        this.right = keybinds.right;

        this.player = player;
        this.socket = socket;

        this.keys = {
            right: {
                pressed: false
            },
            left: {
                pressed: false
            },
        }

        this.rotationInterval = null;
    }
    
    userInput() {
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case this.right:
                    this.keys.left.pressed = true;
                    this.startRotating(90, 'left');
                    break;
                case this.left:
                    this.keys.right.pressed = true;
                    this.startRotating(-90, 'right');
                    break;
            }
        });
    
        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.keys.left.pressed = false;
                    this.stopRotating();
                    break;
                case 'ArrowRight':
                    this.keys.right.pressed = false;
                    this.stopRotating();
                    break;
            }
        });
    }

    startRotating(angle, direction) {
        if (!this.rotationInterval && !this.player.isDead) {
            this.socket.emit('keyInput', direction);
            //this.socket.emit('updateSegments', this.player.segments)
            this.player.rotate(angle);
            this.rotationInterval = setInterval(() => {
                this.player.rotate(angle);
            }, 500);
        }
        
    }

    stopRotating() {
        clearInterval(this.rotationInterval);
        this.rotationInterval = null;
    }
}

export default InputHandler;