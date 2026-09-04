document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('digdug-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  const tileSize = 40;
  const gridCount = 10;
  let score = 0;
  let isPlaying = false;
  let gameInterval;

  let player = { x: 0, y: 0, dirX: 1, dirY: 0 };
  let enemy = { x: 8, y: 8 };
  let harpoon = null;

  // 1 = Solid Dirt, 0 = Tunnel/Empty
  let dirtGrid = [];

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    let nextX = player.x;
    let nextY = player.y;

    if (e.key === 'ArrowUp') { nextY--; player.dirX = 0; player.dirY = -1; }
    if (e.key === 'ArrowDown') { nextY++; player.dirX = 0; player.dirY = 1; }
    if (e.key === 'ArrowLeft') { nextX--; player.dirX = -1; player.dirY = 0; }
    if (e.key === 'ArrowRight') { nextX++; player.dirX = 1; player.dirY = 0; }

    if (nextX >= 0 && nextX < gridCount && nextY >= 0 && nextY < gridCount) {
      player.x = nextX;
      player.y = nextY;
      if (dirtGrid[nextY][nextX] === 1) {
        dirtGrid[nextY][nextX] = 0; // Dig out tunnel
        score += 5;
        scoreEl.textContent = `Score: ${score}`;
      }
    }

    if (e.code === 'Space' && !harpoon) {
      harpoon = { x: player.x, y: player.y, dx: player.dirX, dy: player.dirY, dist: 0 };
    }
  });

  function startGame() {
    isPlaying = true;
    score = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    player = { x: 0, y: 0, dirX: 1, dirY: 0 };
    enemy = { x: 8, y: 8 };
    harpoon = null;

    // Initialize solid dirt grid (top row open)
    dirtGrid = Array.from({ length: gridCount }, (_, r) => 
      Array.from({ length: gridCount }, (_, c) => (r === 0 ? 0 : 1))
    );

    clearInterval(gameInterval);
    gameInterval = setInterval(update, 300);
  }

  function update() {
    if (!isPlaying) return;

    // Enemy AI tracking player slowly
    if (Math.random() < 0.7) {
      if (enemy.x < player.x && dirtGrid[enemy.y][enemy.x + 1] !== 1) enemy.x++;
      else if (enemy.x > player.x && dirtGrid[enemy.y][enemy.x - 1] !== 1) enemy.x--;
      else if (enemy.y < player.y && dirtGrid[enemy.y + 1][enemy.x] !== 1) enemy.y++;
      else if (enemy.y > player.y && dirtGrid[enemy.y - 1][enemy.x] !== 1) enemy.y--;
    }

    // Update Harpoon
    if (harpoon) {
      harpoon.x += harpoon.dx;
      harpoon.y += harpoon.dy;
      harpoon.dist++;

      // Check hit enemy
      if (harpoon.x === enemy.x && harpoon.y === enemy.y) {
        score += 50;
        scoreEl.textContent = `Score: ${score}`;
        msgEl.textContent = "ENEMY ELIMINATED!";
        setTimeout(() => msgEl.textContent = '', 1500);
        enemy = { x: Math.floor(Math.random() * 8 + 1), y: Math.floor(Math.random() * 8 + 1) };
        harpoon = null;
      } else if (harpoon.dist > 3 || harpoon.x < 0 || harpoon.x >= gridCount || harpoon.y < 0 || harpoon.y >= gridCount) {
        harpoon = null;
      }
    }

    // Check enemy collision with player
    if (player.x === enemy.x && player.y === enemy.y) {
      isPlaying = false;
      clearInterval(gameInterval);
      msgEl.textContent = "CAUGHT BY SUBTERRANEAN ENEMY. GAME OVER.";
      msgEl.style.color = "#ef4444";
      return;
    }

    render();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Dirt / Tunnels
    for (let r = 0; r < gridCount; r++) {
      for (let c = 0; c < gridCount; c++) {
        if (dirtGrid[r][c] === 1) {
          ctx.fillStyle = '#7c5cff';
          ctx.fillRect(c * tileSize + 2, r * tileSize + 2, tileSize - 4, tileSize - 4);
        }
      }
    }

    // Draw Harpoon
    if (harpoon) {
      ctx.fillStyle = '#00e5b8';
      ctx.fillRect(harpoon.x * tileSize + 15, harpoon.y * tileSize + 15, 10, 10);
    }

    // Draw Player
    ctx.fillStyle = '#00e5b8';
    ctx.beginPath();
    ctx.arc(player.x * tileSize + tileSize/2, player.y * tileSize + tileSize/2, 14, 0, Math.PI * 2);
    ctx.fill();

    // Draw Enemy
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(enemy.x * tileSize + 8, enemy.y * tileSize + 8, 24, 24);
  }

  resetBtn.addEventListener('click', startGame);
  startGame();
});