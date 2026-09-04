document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('crossy-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  const tileSize = 40;
  let score = 0;
  let maxScore = 0;
  let isPlaying = false;
  let gameLoop;

  let player = { x: 4, y: 11 };
  let lanes = [];

  function initLanes() {
    lanes = [];
    // 12 rows total
    for (let i = 0; i < 12; i++) {
      let type = (i === 0 || i === 11) ? 'safe' : (Math.random() < 0.5 ? 'road' : 'safe');
      lanes.push({
        y: i,
        type: type,
        speed: type === 'road' ? (Math.random() < 0.5 ? 2 : -2) : 0,
        obstacles: type === 'road' ? [
          { x: Math.random() * 10, width: 2 },
          { x: (Math.random() * 5 + 5), width: 2 }
        ] : []
      });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.key === 'ArrowUp' && player.y > 0) {
      player.y--;
      maxScore = Math.max(maxScore, 11 - player.y);
      score = maxScore * 10;
      scoreEl.textContent = `Score: ${score}`;
    }
    if (e.key === 'ArrowDown' && player.y < 11) player.y++;
    if (e.key === 'ArrowLeft' && player.x > 0) player.x--;
    if (e.key === 'ArrowRight' && player.x < 9) player.x++;
  });

  function startGame() {
    isPlaying = true;
    score = 0;
    maxScore = 0;
    player = { x: 4, y: 11 };
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    initLanes();
    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Lanes
    lanes.forEach(lane => {
      if (lane.type === 'road') {
        lane.obstacles.forEach(obs => {
          obs.x += lane.speed / 20;
          if (obs.x > 10) obs.x = -obs.width;
          if (obs.x < -obs.width) obs.x = 10;

          // Collision Check
          if (player.y === lane.y) {
            let playerLeft = player.x;
            let playerRight = player.x + 0.8;
            let obsLeft = obs.x;
            let obsRight = obs.x + obs.width;

            if (playerRight > obsLeft && playerLeft < obsRight) {
              gameOver();
            }
          }
        });
      }
    });

    // Render Grid / Lanes
    lanes.forEach(lane => {
      ctx.fillStyle = lane.type === 'safe' ? 'rgba(124, 92, 255, 0.1)' : 'rgba(30, 30, 40, 0.8)';
      ctx.fillRect(0, lane.y * tileSize, canvas.width, tileSize);

      if (lane.type === 'road') {
        ctx.fillStyle = '#ef4444';
        lane.obstacles.forEach(obs => {
          ctx.fillRect(obs.x * tileSize, lane.y * tileSize + 8, obs.width * tileSize, tileSize - 16);
        });
      }
    });

    // Draw Player
    ctx.fillStyle = '#00e5b8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00e5b8';
    ctx.fillRect(player.x * tileSize + 8, player.y * tileSize + 8, tileSize - 16, tileSize - 16);
    ctx.shadowBlur = 0;

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    msgEl.textContent = `RUN OVER. Final Score: ${score}`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});