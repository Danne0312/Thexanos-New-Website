const canvas = document.getElementById('snakeCanvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');

const box = 20; // Size of each box in the grid
let snake = [{ x: 9 * box, y: 9 * box }]; // Initial position of the snake
let direction = null; // Direction of the snake
let food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box }; // Initial food position
let score = 0; // Initial score
let game; // Game interval

// Load the image for the snake
const snakeImage = new Image();
snakeImage.src = 'xannystare.png';

// Load the image for the fruit
const fruitImage = new Image();
fruitImage.src = 'xanono.png';

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the food
    ctx.drawImage(fruitImage, food.x, food.y, box, box);

    // Draw the snake using the image
    for (let i = 0; i < snake.length; i++) {
        ctx.drawImage(snakeImage, snake[i].x, snake[i].y, box, box);
    }

    // Move the snake
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    // Check if the snake eats the food
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        }; // New food position
    } else {
        snake.pop(); // Remove the tail
    }

    // Add new head
    const newHead = { x: snakeX, y: snakeY };

    // Game over conditions
    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        document.getElementById('final-score').innerText = score; // Set the final score
        document.getElementById('game-over-modal').style.display = 'block'; // Show the modal

        // Show the Start Game button again
        document.getElementById('start-game-btn').style.display = 'block';
    }

    snake.unshift(newHead); // Add new head to the snake

    // Display score in a fancy way
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10);
}

// Check for collision with the snake itself
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

// Control the snake with arrow keys
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (event.key === 'ArrowUp' && direction !== 'DOWN') {
        direction = 'UP';
    } else if (event.key === 'ArrowRight' && direction !== 'LEFT') {
        direction = 'RIGHT';
    } else if (event.key === 'ArrowDown' && direction !== 'UP') {
        direction = 'DOWN';
    }
});

// Touch controls
document.getElementById('left-btn').addEventListener('click', () => {
    if (direction !== 'RIGHT') {
        direction = 'LEFT';
    }
});

document.getElementById('up-btn').addEventListener('click', () => {
    if (direction !== 'DOWN') {
        direction = 'UP';
    }
});

document.getElementById('down-btn').addEventListener('click', () => {
    if (direction !== 'UP') {
        direction = 'DOWN';
    }
});

document.getElementById('right-btn').addEventListener('click', () => {
    if (direction !== 'LEFT') {
        direction = 'RIGHT';
    }
});

// Start the game
document.getElementById('start-game-btn').addEventListener('click', () => {
    snake = [{ x: 9 * box, y: 9 * box }]; // Reset snake position
    direction = null; // Reset direction
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    }; // Reset food position
    score = 0; // Reset score
    clearInterval(game); // Clear any existing game intervals
    game = setInterval(draw, 200); // Start the game loop

    // Hide the Start Game button
    document.getElementById('start-game-btn').style.display = 'none';
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-modal').style.display = 'none'; // Hide the modal
    // Reset game state here (similar to the start game logic)
    snake = [{ x: 9 * box, y: 9 * box }]; // Reset snake position
    direction = null; // Reset direction
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    }; // Reset food position
    score = 0; // Reset score
    clearInterval(game); // Clear any existing game intervals
    game = setInterval(draw, 200); // Start the game loop
});