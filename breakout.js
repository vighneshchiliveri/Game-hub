document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('breakout-canvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const messageElement = document.getElementById('game-message');

  let score = 0;
  let gameInterval;
  let isGameOver = true;

  // Ball
  let ballRadius = 8;
  let x = canvas.width / 2;
  let y = canvas.height - 30;
  let dx = 3;
  let dy = -3;

  // Paddle
  let paddleHeight = 10;
  let paddleWidth = 75;
  let paddleX = (canvas.width - paddleWidth) / 2;
  let rightPressed = false;
  let leftPressed = false;

  // Bricks
  let brickRowCount = 5;
  let brickColumnCount = 6;
  let brickWidth = 65;
  let brickHeight = 20;
  let brickPadding = 10;
  let brickOffsetTop = 30;
  let brickOffsetLeft = 20;
  let bricks = [];

  function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  document.addEventListener("keydown", (e) => { if(e.key == "Right" || e.key == "ArrowRight") rightPressed = true; else if(e.key == "Left" || e.key == "ArrowLeft") leftPressed = true; });
  document.addEventListener("keyup", (e) => { if(e.key == "Right" || e.key == "ArrowRight") rightPressed = false; else if(e.key == "Left" || e.key == "ArrowLeft") leftPressed = false; });
  document.addEventListener("mousemove", (e) => {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if(relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - paddleWidth/2;
    }
  });

  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status === 1) {
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
            dy = -dy;
            b.status = 0;
            score++;
            scoreElement.textContent = `Score: ${score}`;
            if (score === brickRowCount * brickColumnCount) {
              messageElement.textContent = "YOU WIN, CONGRATS!";
              isGameOver = true;
              cancelAnimationFrame(gameInterval);
            }
          }
        }
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#00e5b8"; // var(--teal)
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#7c5cff"; // var(--accent)
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = (r % 2 === 0) ? "#7c5cff" : "#00e5b8";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  function draw() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - ballRadius) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
        // Add a little spin depending on where it hit the paddle
        dx = dx + ((x - (paddleX + paddleWidth/2)) * 0.05); 
      } else {
        messageElement.textContent = "GAME OVER";
        messageElement.style.color = "#ef4444";
        isGameOver = true;
        return;
      }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx;
    y += dy;
    gameInterval = requestAnimationFrame(draw);
  }

  function startGame() {
    isGameOver = false;
    score = 0;
    scoreElement.textContent = `Score: 0`;
    messageElement.textContent = "";
    messageElement.style.color = "var(--teal)";
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    initBricks();
    resetBtn.textContent = "Restart Game";
    cancelAnimationFrame(gameInterval);
    draw();
  }

  resetBtn.addEventListener('click', startGame);
});