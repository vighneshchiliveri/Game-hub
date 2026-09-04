document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('frogger-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  const gridSize = 40;
  let score = 0;
  let isPlaying = false;
  let gameLoop;

  let frog = { x: 4, y: 9 };

  // Obstacles setup (lanes 1-3: cars, lanes 5-7: logs)
  let cars = [
    { x: 0, y: 7, speed: 2, width: 80 },
    { x: 200, y: 7, speed: 2, width: 80 },
    { x: 100, y: 6, speed: -3, width: 60 },
    { x: 300, y: 6, speed: -3, width: 60 },
    { x: 50, y: 5, speed: 1.5, width: 100 }
  ];

  let logs = [
    { x: 0, y: 2, speed: 1.5, width: 120 },
    { x: 250, y: 2, speed: 1.5, width: 120 },
    { x: 100, y: 1, speed: -2, width: 100 }
  ];

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.key === 'ArrowUp' && frog.y > 0) { frog.y--; score += 10; scoreEl.textContent = `Score: ${score}`; }
    if (e.key === 'ArrowDown' && frog.y < 9) frog.y++;
    if (e.key === 'ArrowLeft' && frog.x > 0) frog.x--;
    if (e.key === 'ArrowRight' && frog.x < 9) frog.x++;

    if (frog.y === 0) {
      score += 100;
      scoreEl.textContent = `Score: ${score}`;
      msgEl.textContent = "ZONE REACHED! +100 PTS";
      frog = { x: 4, y: 9 };
      setTimeout(() => msgEl.textContent = '', 1500);
    }
  });

  function initGame() {
    score = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    isPlaying = true;
    resetBtn.textContent = 'Restart Game';
    frog = { x: 4, y: 9 };

    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and Draw Cars
    ctx.fillStyle = '#ef4444';
    cars.forEach(car => {
      car.x += car.speed;
      if (car.x > canvas.width) car.x = -car.width;
      if (car.x < -car.width) car.x = canvas.width;

      ctx.fillRect(car.x, car.y * gridSize + 5, car.width, gridSize - 10);

      // Collision Check (Frog vs Cars)
      let frogPixelX = frog.x * gridSize;
      let frogPixelY = frog.y * gridSize;
      if (
        frog.y === car.y &&
        frogPixelX + gridSize > car.x &&
        frogPixelX < car.x + car.width
      ) {
        gameOver("RUN OVER. GAME OVER.");
      }
    });

    // Update and Draw Logs
    ctx.fillStyle = '#a288ff';
    let onLog = false;
    logs.forEach(log => {
      log.x += log.speed;
      if (log.x > canvas.width) log.x = -log.width;
      if (log.x < -log.width) log.x = canvas.width;

      ctx.fillRect(log.x, log.y * gridSize + 5, log.width, gridSize - 10);

      // Log Ride Check
      let frogPixelX = frog.x * gridSize;
      if (
        frog.y === log.y &&
        frogPixelX + gridSize > log.x &&
        frogPixelX < log.x + log.width
      ) {
        onLog = true;
        frog.x += log.speed / gridSize; // Drift with log
      }
    });

    // River Death Check (Rows 1 and 2 are water)
    if ((frog.y === 1 || frog.y === 2) && !onLog) {
      gameOver("DROWNED IN THE STREAM. GAME OVER.");
    }

    // Keep frog inside bounds horizontally if drifting
    if (frog.x < 0 || frog.x > 9) {
      gameOver("SWEPT OFF THE GRID.");
    }

    // Draw Safe Zones (Row 0 and Row 4/8)
    ctx.fillStyle = 'rgba(124, 92, 255, 0.15)';
    ctx.fillRect(0, 0, canvas.width, gridSize);
    ctx.fillRect(0, 4 * gridSize, canvas.width, gridSize);
    ctx.fillRect(0, 8 * gridSize, canvas.width, gridSize);

    // Draw Frog
    ctx.fillStyle = '#00e5b8';
    ctx.fillRect(frog.x * gridSize + 6, frog.y * gridSize + 6, gridSize - 12, gridSize - 12);

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver(reason) {
    isPlaying = false;
    msgEl.textContent = reason;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});