class InputHandler {
    constructor(player, socket) {
        this.player = player;
        this.socket = socket;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        const movingDirection = { x: 0, y: 0 };
        if (event.key === 'ArrowUp') movingDirection.y = -3;
        if (event.key === 'ArrowDown') movingDirection.y = 3;
        if (event.key === 'ArrowLeft') movingDirection.x = -3;
        if (event.key === 'ArrowRight') movingDirection.x = 3;

        this.player.setMovingDirection(movingDirection);
    }
}

export default InputHandler;
