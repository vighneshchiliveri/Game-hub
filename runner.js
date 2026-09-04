document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('runner-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  const groundY = 240;
  let runner = {
    x: 80, y: groundY, width: 30, height: 40, vy: 0, isJumping: false, isDucking: false
  };

  let obstacles = [];
  let obstacleTimer = 0;
  let gameSpeed = 5;

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.code === 'Space' && !runner.isJumping) {
      runner.vy = -10;
      runner.isJumping = true;
      runner.isDucking = false;
      runner.height = 40;
    }
    if (e.code === 'ArrowDown') {
      if (!runner.isJumping) {
        runner.isDucking = true;
        runner.height = 20;
        runner.y = groundY + 20;
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' && runner.isDucking) {
      runner.isDucking = false;
      runner.height = 40;
      runner.y = groundY;
    }
  });

  function startGame() {
    isPlaying = true;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    obstacleTimer = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Run';
    runner = { x: 80, y: groundY, width: 30, height: 40, vy: 0, isJumping: false, isDucking: false };

    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Runner Physics
    runner.vy += 0.5; // gravity
    runner.y += runner.vy;

    if (runner.y >= groundY) {
      runner.y = groundY;
      runner.vy = 0;
      runner.isJumping = false;
    }

    // Spawn Obstacles
    obstacleTimer++;
    if (obstacleTimer > Math.max(50, 120 - Math.floor(score / 100))) {
      obstacleTimer = 0;
      let type = Math.random() < 0.7 ? 'ground' : 'air';
      obstacles.push({
        x: canvas.width,
        y: type === 'ground' ? groundY : groundY - 35,
        width: 25,
        height: type === 'ground' ? 40 : 25,
        type: type
      });
      gameSpeed += 0.05; // Gradual acceleration
    }

    // Move & Draw Obstacles
    ctx.fillStyle = '#ef4444';
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      obs.x -= gameSpeed;

      // Remove off-screen obstacles
      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
        score += 10;
        scoreEl.textContent = `Score: ${score}`;
        continue;
      }

      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      // Collision Detection (AABB)
      if (
        runner.x < obs.x + obs.width &&
        runner.x + runner.width > obs.x &&
        runner.y < obs.y + obs.height &&
        runner.y + runner.height > obs.y
      ) {
        gameOver();
        return;
      }
    }

    // Draw Ground Line
    ctx.strokeStyle = '#7c5cff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 40);
    ctx.lineTo(canvas.width, groundY + 40);
    ctx.stroke();

    // Draw Runner
    ctx.fillStyle = '#00e5b8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00e5b8';
    ctx.fillRect(runner.x, runner.y, runner.width, runner.height);
    ctx.shadowBlur = 0; // Reset

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    msgEl.textContent = `CRASHED AT SCORE: ${score}. GAME OVER.`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});