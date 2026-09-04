document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('invaders-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  let player = { x: 220, y: 360, width: 40, height: 20, speed: 5, dx: 0 };
  let bullets = [];
  let enemies = [];
  let enemyDirection = 1;
  let enemySpeed = 1;

  function initEnemies() {
    enemies = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        enemies.push({ x: 30 + col * 50, y: 30 + row * 40, width: 30, height: 20, status: 1 });
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.dx = -player.speed;
    if (e.code === 'ArrowRight') player.dx = player.speed;
    if (e.code === 'Space' && isPlaying) {
      if (bullets.length < 3) bullets.push({ x: player.x + player.width/2 - 2, y: player.y, width: 4, height: 10, speed: 7 });
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.dx = 0;
  });

  function update() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    ctx.fillStyle = "#00e5b8"; // var(--teal)
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Bullets
    ctx.fillStyle = "#7c5cff"; // var(--accent)
    for (let i = 0; i < bullets.length; i++) {
      let b = bullets[i];
      b.y -= b.speed;
      ctx.fillRect(b.x, b.y, b.width, b.height);
      if (b.y < 0) { bullets.splice(i, 1); i--; }
    }

    // Enemies
    let hitWall = false;
    ctx.fillStyle = "#f43f5e";
    enemies.forEach(e => {
      if (e.status === 1) {
        e.x += enemySpeed * enemyDirection;
        if (e.x <= 0 || e.x + e.width >= canvas.width) hitWall = true;
        ctx.fillRect(e.x, e.y, e.width, e.height);
      }
    });

    if (hitWall) {
      enemyDirection *= -1;
      enemies.forEach(e => e.y += 20);
    }

    // Collisions
    bullets.forEach((b, bIdx) => {
      enemies.forEach(e => {
        if (e.status === 1 && b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
          e.status = 0;
          bullets.splice(bIdx, 1);
          score += 10;
          scoreEl.textContent = `Score: ${score}`;
        }
      });
    });

    // Win/Lose Condition
    let activeEnemies = enemies.filter(e => e.status === 1);
    if (activeEnemies.length === 0) {
      msgEl.textContent = "YOU SAVED THE GALAXY!";
      isPlaying = false;
    } else if (activeEnemies.some(e => e.y + e.height >= player.y)) {
      msgEl.textContent = "GAME OVER. THEY INVADED.";
      msgEl.style.color = "#ef4444";
      isPlaying = false;
    }

    if (isPlaying) gameLoop = requestAnimationFrame(update);
  }

  resetBtn.addEventListener('click', () => {
    score = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = "";
    player.x = 220;
    bullets = [];
    enemyDirection = 1;
    initEnemies();
    isPlaying = true;
    resetBtn.textContent = "Restart Game";
    cancelAnimationFrame(gameLoop);
    update();
  });
});