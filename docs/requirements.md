# Snake Game
CS5410 Final Project

## Requirements
*Copied from project requirements*
Assignment

Write a multiplayer snake game patterned after the following: https://snake.io/


### Gameplay

Must substantially implement the snake.io game play, using the actual game as a reference.

+ Two or more players participate in an online arena to become the biggest, baddest snake around!
+ The gameplay arena is much larger than the players view
+ Use (almost) the same approach as snake.io for joining a game
    + Step 1: Give the player a chance to name themselves
        + There is only one server, don't need to offer anything related to server selection or room selection
    + Step 2: Give the user the option to use the mouse or keyboard, using a similar message/diagram
    + Step 3: Show the Tutorial message/diagram "Your snake will follow your mouse" or something else appropriate for the keyboard, such as, "The snake will change direction based on keypress"
    + Step 4: Then show the joining message and once joined, the player begins participating in the game
        + The new player should join in a location that has the least density of other snakes; a safe location
### Gameplay elements
+ User controlled snake, either keyboard or mouse control
    + Randomly located food that refreshes periodically during gameplay
    + When a snake runs into another snake, that snake dies and its segments leave behind food in place of its body segments
        + Snake can cross itself without dying
    + Following death, an end game panel is displayed that shows the user's score, kills, and highest position achieved
        + The game continues to display underneath this panel
        + An option to return to the main menu should be available; rather than the "Next" used in the snake.io game.
### Controls
+ Mouse
    + Snake moves in the direction of the vector formed by the head of the snake and the location of the mouse
+ Keyboard
    + Defaults to arrow keys for movement
    + User ability to configure these controls, with the controls persisted to the computer/browser
### Snake
+ Show player name beside the head of the snake
+ Unique head texture
+ Unique tail texture
+ Other segments all have the same texture
+ Note the movement of the snake is smooth, they don't follow any particular grid pattern; your game must also do this.  To help clarify, the ECS snake game I showed in class uses a grid of squares to represent the gameplay area, this game must not do that.  If the game in written to use a grid of squares, the max possible points for key elements of the game will be reduced to about 25%, because the complexity difference is that great.
### Camera
+ Head of the player's snake is always centered in the play area
### Food
+ Multiple different kinds and sizes
+ Must utilize an animated sprite
### Game Status
+ Current score
+ Panel that shows up to the top 5 snakes (currently playing the game)
### Must utilize particle effects...
+ Small effect when food is eaten
+ Effect at the head when a snake runs into another snake
+ Background image that moves as the player view moves

### Technical & Other Requirements

+ Create a particle system that manages all ongoing effects.  The particle system must expose functions like playerDeath(...), enemyDeath(...), one for each type of particle effect.  You may (not required) start with the particle system code I have provided, but be aware that it does not meet the requirements necessary for this assignment, you'll need to update/improve the implementation.
+ User ability to define the movement controls
    + Initial configuration is arrow keys for keyboard movement
    + Configuration is persisted to the computer/browser
    + The interface for this must present a screen where the name of the game function is displayed and to the right of it, the configured key. Using the mouse or navigating with the keyboard, the user can select the action (Enter key for keyboard control), then some visual will change to indicate it is possible to now select a new key, then the user presses the new key and that immediately becomes the new key for that game function.  Providing a textbox the user uses to edit the key is not appropriate, we want to create nice UIs for the user.
    + Here is a link to a video that demonstrates an example UI for configuring controls: link
    Sound effects on...
        + Food eaten
        + Death of snake
+ Display of top 5 high scores, persisted and restored from the computer/browser
+ If web based solution
    + Must be a Node.js server-based solution
    + Use HTML5 2D Canvas rendering
    + Works correctly on both Firefox and Chrome/Edge

### Menu Interface
+ New Game
+ High Scores
+ Controls
+ Credits


### Graphical & Sounds Assets

+ Resource that has a lot of textures, sprites, animated sprites, and audio: https://opengameart.org/ 
+ Another resource that has sprites and animated sprites from existing games: https://www.spriters-resource.com/
+ Resource that has a good sets of sounds from other games: https://www.sounds-resource.com/
