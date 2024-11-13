const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audio = new Audio("../assets/audio.mp3");

const size = 30;

const initialPosition = { x: 270, y: 240 };

let snake = [initialPosition];

const incrementScore = () => {
    score.innerText = +score.innerText + 10;
};

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / size) * size; // Corrigido para usar o tamanho da cobra
};

const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);
    return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
};

let direction, loopId;

const drawFood = () => {
    const { x, y, color } = food;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.shadowBlur = 0;
};

const drawSnake = () => {
    ctx.fillStyle = "#ddd";
    snake.forEach((position, index) => {
        ctx.fillStyle = index === snake.length - 1 ? "white" : "#ddd"; // Última parte da cobra é branca
        ctx.fillRect(position.x, position.y, size, size);
    });
};

const moveSnake = () => {
    if (!direction) return;

    const head = snake[snake.length - 1];

    const newHead = { ...head }; // Copia a posição da cabeça

    if (direction === "right") newHead.x += size;
    if (direction === "left") newHead.x -= size;
    if (direction === "down") newHead.y += size;
    if (direction === "up") newHead.y -= size;

    snake.push(newHead);
    snake.shift(); // Remove a cauda da cobra
};

const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";
    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
};

const checkEat = () => {
    const head = snake[snake.length - 1];
    if (head.x === food.x && head.y === food.y) {
        incrementScore();
        snake.push(head); // Não remove a cauda, a cobra cresce
        audio.play();

        let x, y;
        do {
            x = randomPosition();
            y = randomPosition();
        } while (snake.find((position) => position.x === x && position.y === y));

        food.x = x;
        food.y = y;
        food.color = randomColor();
    }
};

const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x === head.x && position.y === head.y;
    });

    if (wallCollision || selfCollision) {
        gameOver();
    }
};

const gameOver = () => {
    direction = undefined;
    menu.style.display = "flex";
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(2px)";
};

const gameLoop = () => {
    clearInterval(loopId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollision();

    loopId = setTimeout(() => {
        gameLoop();
    }, 300); // Ajuste o tempo conforme necessário para a velocidade do jogo
};

gameLoop();

document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direction !== "left") {
        direction = "right";
    }
    if (key === "ArrowLeft" && direction !== "right") {
        direction = "left";
    }
    if (key === "ArrowDown" && direction !== "up") {
        direction = "down";
    }
    if (key === "ArrowUp" && direction !== "down") {
        direction = "up";
    }
});

// Adicionando suporte a toques para dispositivos móveis
const touchControls = (event) => {
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const canvasRect = canvas.getBoundingClientRect();
    const canvasX = touchX - canvasRect.left;
    const canvasY = touchY - canvasRect.top;

    if (canvasX > canvas.width / 2) {
        direction = "right";
    } else {
        direction = "left";
    }

    if (canvasY > canvas.height / 2) {
        direction = "down";
    } else {
        direction = "up";
    }
};

canvas.addEventListener("touchstart", touchControls);

buttonPlay.addEventListener("click", () => {
    score.innerText = "00"; // Reseta o score
    menu.style.display = "none"; // Oculta o menu
    canvas.style.filter = "none"; // Remove o filtro do canvas
    direction = undefined; // Reseta a direção ao reiniciar
    snake = [initialPosition]; // Reseta a posição da cobra
    food.x = randomPosition(); // Reposiciona a comida
    food.y = randomPosition();
    food.color = randomColor(); // Reposiciona a comida com uma nova cor
    gameLoop(); // Reinicia o loop do jogo
});