document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('helicopter-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let distance = 0;

  let copter = { x: 100, y: 200, vy: 0, size: 20 };
  const gravity = 0.4;
  const lift = -0.7;

  let tunnelSegments = [];
  let tunnelSpeed = 4;
  let topHeight = 80;
  let bottomHeight = 80;

  let isThrusting = false;

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      isThrusting = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isThrusting = false;
    }
  });

  canvas.addEventListener('mousedown', () => isThrusting = true);
  canvas.addEventListener('mouseup', () => isThrusting = false);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isThrusting = true; });
  canvas.addEventListener('touchend', () => isThrusting = false);

  function initTunnel() {
    tunnelSegments = [];
    for (let i = 0; i <= canvas.width; i += 20) {
      tunnelSegments.push({ x: i, top: 80, bottom: 80 });
    }
  }

  function startGame() {
    isPlaying = true;
    distance = 0;
    scoreEl.textContent = `Distance: 0m`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';
    copter = { x: 100, y: 200, vy: 0, size: 20 };
    topHeight = 80;
    bottomHeight = 80;

    initTunnel();
    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Physics
    if (isThrusting) {
      copter.vy += lift;
    } else {
      copter.vy += gravity;
    }
    copter.y += copter.vy;

    // Advance tunnel and modulate height randomly
    tunnelSegments.forEach(seg => {
      seg.x -= tunnelSpeed;
    });

    if (tunnelSegments[0].x <= -20) {
      tunnelSegments.shift();
      let last = tunnelSegments[tunnelSegments.length - 1];
      
      // Random walk for tunnel bounds
      topHeight += (Math.random() - 0.5) * 30;
      bottomHeight += (Math.random() - 0.5) * 30;

      // Keep safe bounds
      topHeight = Math.max(30, Math.min(180, topHeight));
      bottomHeight = Math.max(30, Math.min(180, bottomHeight));

      tunnelSegments.push({
        x: last.x + 20,
        top: topHeight,
        bottom: bottomHeight
      });
    }

    distance += 1;
    scoreEl.textContent = `Distance: ${distance}m`;

    // Draw Tunnel Walls
    ctx.fillStyle = '#7c5cff';
    tunnelSegments.forEach(seg => {
      // Top wall
      ctx.fillRect(seg.x, 0, 22, seg.top);
      // Bottom wall
      ctx.fillRect(seg.x, canvas.height - seg.bottom, 22, seg.bottom);

      // Collision Detection against segment directly underneath/above copter
      if (copter.x >= seg.x && copter.x <= seg.x + 22) {
        if (copter.y - copter.size / 2 <= seg.top || copter.y + copter.size / 2 >= canvas.height - seg.bottom) {
          gameOver();
        }
      }
    });

    // Check ceiling/floor boundaries
    if (copter.y < 0 || copter.y > canvas.height) {
      gameOver();
    }

    // Draw Copter
    ctx.fillStyle = '#00e5b8';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00e5b8';
    ctx.fillRect(copter.x - 15, copter.y - 10, 30, 20);
    ctx.shadowBlur = 0; // Reset for performance

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    isThrusting = false;
    msgEl.textContent = `HULL BREACH AT ${distance}M. GAME OVER.`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});