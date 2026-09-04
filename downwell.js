document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('downwell-canvas');
  const ctx = canvas.getContext('2d');
  const depthEl = document.getElementById('depth-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let depth = 0;

  let player = { x: 200, y: 100, width: 20, height: 25, vx: 0, vy: 0 };
  let platforms = [];
  let bullets = [];
  let enemies = [];

  const gravity = 0.25;
  let keys = { ArrowLeft: false, ArrowRight: false };

  document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.code === 'Space' && isPlaying) {
      // Shoot downward boots
      bullets.push({ x: player.x, y: player.y + 15, vy: 8 });
      player.vy = -3; // slight recoil hover
    }
  });

  document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
  });

  function initPlatforms() {
    platforms = [];
    for (let i = 0; i < 8; i++) {
      platforms.push({
        x: Math.random() * 250 + 50,
        y: i * 70 + 150,
        width: 120,
        height: 12
      });
    }
  }

  function startGame() {
    isPlaying = true;
    depth = 0;
    bullets = [];
    enemies = [];
    player = { x: 200, y: 80, width: 20, height: 25, vx: 0, vy: 0 };
    depthEl.textContent = `Depth: 0m`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Descent';

    initPlatforms();
    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Horizontal Movement
    if (keys.ArrowLeft) player.vx = -3;
    else if (keys.ArrowRight) player.vx = 3;
    else player.vx = 0;

    player.x += player.vx;
    player.vy += gravity;
    player.y += player.vy;

    // Screen Wrap Horizontal
    if (player.x < 0) player.x = canvas.width;
    else if (player.x > canvas.width) player.x = 0;

    // Scroll world upward as player descends
    if (player.y > canvas.height / 2) {
      let diff = player.y - (canvas.height / 2);
      player.y = canvas.height / 2;
      depth += Math.floor(diff);
      depthEl.textContent = `Depth: ${depth}m`;

      platforms.forEach(p => p.y -= diff);
      bullets.forEach(b => b.y -= diff);
      enemies.forEach(en => en.y -= diff);
    }

    // Platform Collisions (Only when falling)
    if (player.vy > 0) {
      platforms.forEach(p => {
        if (
          player.x + player.width > p.x &&
          player.x < p.x + p.width &&
          player.y + player.height >= p.y &&
          player.y + player.height <= p.y + p.height + player.vy
        ) {
          player.y = p.y - player.height;
          player.vy = 0; // land
        }
      });
    }

    // Recycle platforms & spawn enemies
    platforms = platforms.filter(p => p.y < canvas.height + 50);
    while (platforms.length < 8) {
      let topY = Math.min(...platforms.map(p => p.y));
      platforms.push({
        x: Math.random() * 250 + 50,
        y: topY - (Math.random() * 60 + 50),
        width: 120,
        height: 12
      });

      // Chance to spawn an enemy above platform
      if (Math.random() < 0.6) {
        enemies.push({
          x: platforms[platforms.length - 1].x + 40,
          y: platforms[platforms.length - 1].y - 25,
          width: 20,
          height: 20
        });
      }
    }

    // Update Bullets
    ctx.fillStyle = '#00e5b8';
    for (let i = bullets.length - 1; i >= 0; i--) {
      let b = bullets[i];
      b.y += b.vy;
      if (b.y > canvas.height) {
        bullets.splice(i, 1);
        continue;
      }
      ctx.fillRect(b.x - 3, b.y, 6, 12);
    }

    // Update Enemies
    ctx.fillStyle = '#ef4444';
    for (let i = enemies.length - 1; i >= 0; i--) {
      let en = enemies[i];
      if (en.y > canvas.height + 50) {
        enemies.splice(i, 1);
        continue;
      }
      ctx.fillRect(en.x, en.y, en.width, en.height);

      // Check Bullet vs Enemy collision
      for (let j = bullets.length - 1; j >= 0; j--) {
        let b = bullets[j];
        if (
          b.x > en.x && b.x < en.x + en.width &&
          b.y > en.y && b.y < en.y + en.height
        ) {
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          break;
        }
      }

      // Check Player vs Enemy collision
      if (
        player.x + player.width > en.x &&
        player.x < en.x + en.width &&
        player.y + player.height > en.y &&
        player.y < en.y + en.height
      ) {
        gameOver();
        return;
      }
    }

    // Draw Platforms
    ctx.fillStyle = '#7c5cff';
    platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Draw Player
    ctx.fillStyle = '#00e5b8';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Abyss Check
    if (player.y > canvas.height) {
      gameOver();
      return;
    }

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    msgEl.textContent = `FALLEN INTO THE ABYSS. Depth: ${depth}m`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});