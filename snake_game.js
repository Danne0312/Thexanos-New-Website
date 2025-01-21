(function () {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const box = 20; // Grid size
    const snakeImage = new Image();
    snakeImage.src = 'xannystare.png'; // Snake image
    const fruitImage = new Image();
    fruitImage.src = 'xanono.png'; // Fruit image
    const startGameSound = new Audio('opening.MP3');
    const fruitSound = new Audio('fruit.MP3');
    const endingSound = new Audio('ending.MP3');

    let snake = [{ x: 9 * box, y: 9 * box }]; // Initial snake
    let direction = null; // Direction of movement
    let food = generateFood(); // Food position
    let score = 0; // Score
    let gameInterval;

    function generateFood() {
        return {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box,
        };
    }

    function drawGrid() {
        ctx.lineWidth = 0.5;

        for (let x = 0; x < canvas.width; x += box) {
            const hue = (x / canvas.width) * 360;
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += box) {
            const hue = (y / canvas.height) * 360;
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.drawImage(fruitImage, food.x, food.y, box, box);

        for (let i = 0; i < snake.length; i++) {
            ctx.drawImage(snakeImage, snake[i].x, snake[i].y, box, box);
        }
        ctx.shadowBlur = 0;

        let headX = snake[0].x;
        let headY = snake[0].y;

        if (direction === 'LEFT') headX -= box;
        if (direction === 'UP') headY -= box;
        if (direction === 'RIGHT') headX += box;
        if (direction === 'DOWN') headY += box;

        if (headX === food.x && headY === food.y) {
            score++;
            fruitSound.play();
            food = generateFood();
        } else {
            snake.pop();
        }

        const newHead = { x: headX, y: headY };

        if (
            headX < 0 ||
            headY < 0 ||
            headX >= canvas.width ||
            headY >= canvas.height ||
            collision(newHead, snake)
        ) {
            clearInterval(gameInterval);
            endingSound.play();
            displayFinalScore();
            document.getElementById('final-score-container').style.display = 'block';
            document.getElementById('game-over-modal').style.display = 'block';
            document.getElementById('start-game-btn').style.display = 'block';
            return;
        }

        snake.unshift(newHead);

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);
    }

    function collision(head, array) {
        return array.some(segment => head.x === segment.x && head.y === segment.y);
    }

    function displayFinalScore() {
        const finalScoreElement = document.getElementById('final-score');
        finalScoreElement.innerText = score;

        const modalScoreElement = document.getElementById('modal-score');
        modalScoreElement.innerText = score;

        document.getElementById('final-score-container').style.display = 'block';
        document.getElementById('game-over-modal').style.display = 'block';
    }

    document.getElementById('start-game-btn').addEventListener('click', () => {
        startGameSound.play();
        snake = [{ x: 9 * box, y: 9 * box }];
        direction = null;
        food = generateFood();
        score = 0;
        clearInterval(gameInterval);
        gameInterval = setInterval(draw, 200);
        document.getElementById('start-game-btn').style.display = 'none';
        canvas.focus();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        resetGame();
        gameInterval = setInterval(draw, 200);
        document.getElementById('game-over-modal').style.display = 'none';
    });

    document.addEventListener('keydown', (event) => {
        if (event.key.startsWith('Arrow')) {
            event.preventDefault();
        }

        if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
        else if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
        else if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
        else if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    });

    document.getElementById('left-btn').addEventListener('click', () => {
        if (direction !== 'RIGHT') direction = 'LEFT';
    });

    document.getElementById('up-btn').addEventListener('click', () => {
        if (direction !== 'DOWN') direction = 'UP';
    });

    document.getElementById('down-btn').addEventListener('click', () => {
        if (direction !== 'UP') direction = 'DOWN';
    });

    document.getElementById('right-btn').addEventListener('click', () => {
        if (direction !== 'LEFT') direction = 'RIGHT';
    });

    function resetGame() {
        snake = [{ x: 9 * box, y: 9 * box }];
        direction = null;
        food = generateFood();
        score = 0;
    }
})();