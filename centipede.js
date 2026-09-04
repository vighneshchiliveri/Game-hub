document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('centipede-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  let player = { x: 235, y: 360, width: 30, height: 16, speed: 5 };
  let bullets = [];
  let centipedeSegments = [];

  let keys = { ArrowLeft: false, ArrowRight: false };

  document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.code === 'Space' && isPlaying) {
      bullets.push({ x: player.x + 12, y: player.y, vy: -7 });
    }
  });

  document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
  });

  function initCentipede() {
    centipedeSegments = [];
    for (let i = 0; i < 8; i++) {
      centipedeSegments.push({
        x: i * 25 + 50,
        y: 40,
        dx: 2,
        radius: 10
      });
    }
  }

  function startGame() {
    isPlaying = true;
    score = 0;
    bullets = [];
    player = { x: 235, y: 360, width: 30, height: 16, speed: 5 };
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    initCentipede();
    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player Movement
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;

    // Bullets Update
    ctx.fillStyle = '#00e5b8';
    for (let i = bullets.length - 1; i >= 0; i--) {
      let b = bullets[i];
      b.y += b.vy;
      if (b.y < 0) {
        bullets.splice(i, 1);
        continue;
      }
      ctx.fillRect(b.x, b.y, 4, 10);
    }

    // Centipede Update & Bounce
    ctx.fillStyle = '#ef4444';
    centipedeSegments.forEach(seg => {
      seg.x += seg.dx;
      if (seg.x <= 10 || seg.x >= canvas.width - 10) {
        seg.dx = -seg.dx;
        seg.y += 20; // drop down row
      }

      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
      ctx.fill();

      // Check bullet collision with segment
      for (let j = bullets.length - 1; j >= 0; j--) {
        let b = bullets[j];
        let dist = Math.sqrt(Math.pow(b.x - seg.x, 2) + Math.pow(b.y - seg.y, 2));
        if (dist < seg.radius + 5) {
          centipedeSegments = centipedeSegments.filter(s => s !== seg);
          bullets.splice(j, 1);
          score += 20;
          scoreEl.textContent = `Score: ${score}`;
          break;
        }
      }

      // Check centipede breach player zone
      if (seg.y >= player.y) {
        gameOver();
      }
    });

    // Win condition check
    if (centipedeSegments.length === 0) {
      initCentipede(); // Respawn next wave
    }

    // Draw Player
    ctx.fillStyle = '#7c5cff';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    msgEl.textContent = `PERIMETER BREACHED. Final Score: ${score}`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});