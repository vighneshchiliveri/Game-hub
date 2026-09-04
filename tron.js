document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tron-canvas');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('status-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameInterval;
  let isPlaying = false;

  const gridSize = 10;
  let p1, p2;
  let grid;

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;

    // Player 1 (Arrows)
    if (e.key === 'ArrowUp' && p1.dy === 0) { p1.dx = 0; p1.dy = -gridSize; }
    if (e.key === 'ArrowDown' && p1.dy === 0) { p1.dx = 0; p1.dy = gridSize; }
    if (e.key === 'ArrowLeft' && p1.dx === 0) { p1.dx = -gridSize; p1.dy = 0; }
    if (e.key === 'ArrowRight' && p1.dx === 0) { p1.dx = gridSize; p1.dy = 0; }

    // Player 2 (WASD)
    if ((e.key === 'w' || e.key === 'W') && p2.dy === 0) { p2.dx = 0; p2.dy = -gridSize; }
    if ((e.key === 's' || e.key === 'S') && p2.dy === 0) { p2.dx = 0; p2.dy = gridSize; }
    if ((e.key === 'a' || e.key === 'A') && p2.dx === 0) { p2.dx = -gridSize; p2.dy = 0; }
    if ((e.key === 'd' || e.key === 'D') && p2.dx === 0) { p2.dx = gridSize; p2.dy = 0; }
  });

  function startGame() {
    isPlaying = true;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Grid';
    statusEl.textContent = 'Grid Live: Drive!';

    // Initialize 2D grid tracker (width: 60, height: 40)
    grid = Array.from({ length: canvas.width / gridSize }, () => Array(canvas.height / gridSize).fill(0));

    p1 = { x: 100, y: 200, dx: gridSize, dy: 0, color: '#00e5b8' };
    p2 = { x: 500, y: 200, dx: -gridSize, dy: 0, color: '#7c5cff' };

    clearInterval(gameInterval);
    gameInterval = setInterval(update, 60); // Fast arcade speed
  }

  function update() {
    if (!isPlaying) return;

    // Move players
    p1.x += p1.dx;
    p1.y += p1.dy;
    p2.x += p2.dx;
    p2.y += p2.dy;

    // Check Wall Collisions
    let p1Crash = p1.x < 0 || p1.x >= canvas.width || p1.y < 0 || p1.y >= canvas.height;
    let p2Crash = p2.x < 0 || p2.x >= canvas.width || p2.y < 0 || p2.y >= canvas.height;

    // Check Trail Collisions
    let gridX1 = p1.x / gridSize;
    let gridY1 = p1.y / gridSize;
    let gridX2 = p2.x / gridSize;
    let gridY2 = p2.y / gridSize;

    if (!p1Crash && grid[gridX1][gridY1] === 1) p1Crash = true;
    if (!p2Crash && grid[gridX2][gridY2] === 1) p2Crash = true;

    // Head-on collision
    if (p1.x === p2.x && p1.y === p2.y) {
      gameOver("MUTUAL DESTRUCTION. DRAW.");
      return;
    }

    if (p1Crash && p2Crash) {
      gameOver("DOUBLE CRASH. DRAW.");
      return;
    } else if (p1Crash) {
      gameOver("PLAYER 2 WINS! P1 DEZONED.");
      return;
    } else if (p2Crash) {
      gameOver("PLAYER 1 WINS! P2 DEZONED.");
      return;
    }

    // Mark trails on grid
    grid[gridX1][gridY1] = 1;
    grid[gridX2][gridY2] = 1;

    render();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid trails
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        if (grid[x][y] === 1) {
          ctx.fillStyle = 'rgba(124, 92, 255, 0.4)';
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
      }
    }

    // Draw Cycles
    ctx.fillStyle = p1.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p1.color;
    ctx.fillRect(p1.x, p1.y, gridSize, gridSize);

    ctx.fillStyle = p2.color;
    ctx.shadowColor = p2.color;
    ctx.fillRect(p2.x, p2.y, gridSize, gridSize);

    ctx.shadowBlur = 0; // Reset
  }

  resetBtn.addEventListener('click', startGame);
});