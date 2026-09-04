document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('pong-board');
  const ball = document.getElementById('pong-ball');
  const p1 = document.getElementById('paddle-left');
  const p2 = document.getElementById('paddle-right');
  const score1El = document.getElementById('p1-score');
  const score2El = document.getElementById('p2-score');
  const resetBtn = document.getElementById('reset-btn');

  let gameLoop;
  let isPlaying = false;
  
  let score1 = 0;
  let score2 = 0;

  let ballX = 292, ballY = 192;
  let ballDX = 4, ballDY = 4;
  let p1Y = 160, p2Y = 160;
  const paddleSpeed = 6;
  const maxBallSpeed = 9;

  let keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

  document.addEventListener('keydown', (e) => { if(keys.hasOwnProperty(e.key)) keys[e.key] = true; });
  document.addEventListener('keyup', (e) => { if(keys.hasOwnProperty(e.key)) keys[e.key] = false; });

  function resetBall() {
    const boardRect = board.getBoundingClientRect();
    ballX = boardRect.width / 2 - 8;
    ballY = boardRect.height / 2 - 8;
    ballDX = (Math.random() > 0.5 ? 4 : -4);
    ballDY = (Math.random() * 4) - 2;
  }

  function update() {
    if (!isPlaying) return;

    const boardRect = board.getBoundingClientRect();
    const p1Rect = p1.getBoundingClientRect();
    const p2Rect = p2.getBoundingClientRect();

    // Player 1 Movement
    if ((keys.w || keys.ArrowUp) && p1Y > 0) p1Y -= paddleSpeed;
    if ((keys.s || keys.ArrowDown) && p1Y < boardRect.height - p1Rect.height) p1Y += paddleSpeed;

    // CPU Movement (Simple AI)
    let p2Center = p2Y + (p2Rect.height / 2);
    if (p2Center < ballY - 10 && p2Y < boardRect.height - p2Rect.height) p2Y += paddleSpeed * 0.75;
    else if (p2Center > ballY + 10 && p2Y > 0) p2Y -= paddleSpeed * 0.75;

    // Ball Movement
    ballX += ballDX;
    ballY += ballDY;

    // Top/Bottom collision
    if (ballY <= 0 || ballY >= boardRect.height - 16) ballDY *= -1;

    // Paddle collision
    if (ballDX < 0 && ballX <= 32 && ballX >= 20 && ballY + 16 >= p1Y && ballY <= p1Y + p1Rect.height) {
      ballDX = Math.min(Math.abs(ballDX) + 0.5, maxBallSpeed); 
      ballDY += (Math.random() - 0.5) * 2;
    }
    
    if (ballDX > 0 && ballX + 16 >= boardRect.width - 32 && ballX <= boardRect.width - 20 && ballY + 16 >= p2Y && ballY <= p2Y + p2Rect.height) {
      ballDX = -Math.min(Math.abs(ballDX) + 0.5, maxBallSpeed);
      ballDY += (Math.random() - 0.5) * 2;
    }

    // Scoring
    if (ballX < 0) { score2++; updateScores(); resetBall(); }
    if (ballX > boardRect.width) { score1++; updateScores(); resetBall(); }

    // Apply styles
    p1.style.top = `${p1Y}px`;
    p2.style.top = `${p2Y}px`;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    gameLoop = requestAnimationFrame(update);
  }

  function updateScores() {
    score1El.textContent = `P1: ${score1}`;
    score2El.textContent = `CPU: ${score2}`;
  }

  resetBtn.addEventListener('click', () => {
    score1 = 0;
    score2 = 0;
    updateScores();
    resetBall();
    if (!isPlaying) {
      isPlaying = true;
      resetBtn.textContent = "Restart Game";
      update();
    }
  });
});