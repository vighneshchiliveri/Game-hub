document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pacman-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  const tileSize = 40;
  let score = 0;
  let gameInterval;
  let isPlaying = false;

  // 1 = Wall, 0 = Pellet, 2 = Empty
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  let pacman = { x: 1, y: 1, dx: 0, dy: 0 };
  let ghost = { x: 8, y: 8 };

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.key === 'ArrowUp') { pacman.dx = 0; pacman.dy = -1; }
    if (e.key === 'ArrowDown') { pacman.dx = 0; pacman.dy = 1; }
    if (e.key === 'ArrowLeft') { pacman.dx = -1; pacman.dy = 0; }
    if (e.key === 'ArrowRight') { pacman.dx = 1; pacman.dy = 0; }
  });

  function initGame() {
    score = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    isPlaying = true;
    resetBtn.textContent = 'Restart Game';

    pacman = { x: 1, y: 1, dx: 0, dy: 0 };
    ghost = { x: 8, y: 8 };

    // Reset pellets in map copy
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 250); // 4 ticks per second
  }

  function update() {
    // Move Pacman
    let nextX = pacman.x + pacman.dx;
    let nextY = pacman.y + pacman.dy;

    if (map[nextY] && map[nextY][nextX] !== 1) {
      pacman.x = nextX;
      pacman.y = nextY;
    }

    // Eat Pellet
    if (map[pacman.y][pacman.x] === 0) {
      map[pacman.y][pacman.x] = 2;
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
    }

    // Move Ghost (simple AI towards pacman)
    if (Math.random() < 0.7) {
      if (ghost.x < pacman.x && map[ghost.y][ghost.x + 1] !== 1) ghost.x++;
      else if (ghost.x > pacman.x && map[ghost.y][ghost.x - 1] !== 1) ghost.x--;
      else if (ghost.y < pacman.y && map[ghost.y + 1][ghost.x] !== 1) ghost.y++;
      else if (ghost.y > pacman.y && map[ghost.y - 1][ghost.x] !== 1) ghost.y--;
    }

    // Check collision with ghost
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      isPlaying = false;
      clearInterval(gameInterval);
      msgEl.textContent = "CAUGHT BY GHOST. GAME OVER.";
      msgEl.style.color = "#ef4444";
      return;
    }

    // Check Win (all pellets eaten)
    let pelletsLeft = map.flat().some(cell => cell === 0);
    if (!pelletsLeft) {
      isPlaying = false;
      clearInterval(gameInterval);
      msgEl.textContent = "MAZE CLEARED! YOU WIN.";
      msgEl.style.color = "var(--accent)";
      return;
    }

    render();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === 1) {
          ctx.fillStyle = '#7c5cff';
          ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        } else if (map[r][c] === 0) {
          ctx.fillStyle = '#00e5b8';
          ctx.beginPath();
          ctx.arc(c * tileSize + tileSize/2, r * tileSize + tileSize/2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw Pac-Man
    ctx.fillStyle = '#00e5b8';
    ctx.beginPath();
    ctx.arc(pacman.x * tileSize + tileSize/2, pacman.y * tileSize + tileSize/2, tileSize/2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Ghost
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ghost.x * tileSize + tileSize/2, ghost.y * tileSize + tileSize/2 - 2, tileSize/2 - 6, Math.PI, 0, false);
    ctx.lineTo(ghost.x * tileSize + tileSize - 6, ghost.y * tileSize + tileSize - 4);
    ctx.lineTo(ghost.x * tileSize + 6, ghost.y * tileSize + tileSize - 4);
    ctx.fill();
  }

  resetBtn.addEventListener('click', initGame);
  render(); // Initial static render
});