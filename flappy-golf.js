document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('golf-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  let ball = { x: 80, y: 250, radius: 12, vy: 0 };
  const gravity = 0.35;
  const flapPower = -7;

  let pipes = [];
  const pipeWidth = 60;
  const gapHeight = 150;
  let pipeTimer = 0;

  function flap() {
    if (!isPlaying) return;
    ball.vy = flapPower;
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap();
    }
  });

  canvas.addEventListener('click', flap);

  function startGame() {
    isPlaying = true;
    score = 0;
    pipes = [];
    pipeTimer = 0;
    ball = { x: 80, y: 250, radius: 12, vy: 0 };
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ball Physics
    ball.vy += gravity;
    ball.y += ball.vy;

    // Spawn Pipes
    pipeTimer++;
    if (pipeTimer > 100) {
      pipeTimer = 0;
      let topHeight = Math.floor(Math.random() * 200) + 50;
      pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - gapHeight,
        passed: false
      });
    }

    // Update & Draw Pipes
    ctx.fillStyle = '#7c5cff';
    for (let i = pipes.length - 1; i >= 0; i--) {
      let p = pipes[i];
      p.x -= 3;

      if (p.x + pipeWidth < 0) {
        pipes.splice(i, 1);
        continue;
      }

      // Draw Top Pipe
      ctx.fillRect(p.x, 0, pipeWidth, p.top);
      // Draw Bottom Pipe
      ctx.fillRect(p.x, canvas.height - p.bottom, pipeWidth, p.bottom);

      // Score check
      if (!p.passed && p.x + pipeWidth < ball.x) {
        p.passed = true;
        score += 10;
        scoreEl.textContent = `Score: ${score}`;
      }

      // Collision Detection
      if (
        ball.x + ball.radius > p.x &&
        ball.x - ball.radius < p.x + pipeWidth &&
        (ball.y - ball.radius < p.top || ball.y + ball.radius > canvas.height - p.bottom)
      ) {
        gameOver();
        return;
      }
    }

    // Floor / Ceiling Boundaries
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      gameOver();
      return;
    }

    // Draw Golf Ball
    ctx.fillStyle = '#00e5b8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00e5b8';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    msgEl.textContent = `OUT OF BOUNDS. Final Score: ${score}`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});