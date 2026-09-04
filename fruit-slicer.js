document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fruit-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;
  let misses = 0;

  let fruits = [];
  let slashTrail = [];
  let isMouseDown = false;

  const gravity = 0.15;

  canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    slashTrail = [{ x: e.offsetX, y: e.offsetY }];
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown || !isPlaying) return;
    slashTrail.push({ x: e.offsetX, y: e.offsetY });
    if (slashTrail.length > 8) slashTrail.shift();

    checkSlices(e.offsetX, e.offsetY);
  });

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
    slashTrail = [];
  });

  function spawnFruit() {
    if (!isPlaying) return;
    fruits.push({
      x: Math.random() * (canvas.width - 200) + 100,
      y: canvas.height + 30,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 4 + 9),
      radius: 25,
      sliced: false,
      color: Math.random() < 0.3 ? '#ef4444' : '#00e5b8'
    });
  }

  function startGame() {
    isPlaying = true;
    score = 0;
    misses = 0;
    fruits = [];
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    cancelAnimationFrame(gameLoop);
    update();

    // Spawning interval loop
    clearInterval(window.fruitSpawnTimer);
    window.fruitSpawnTimer = setInterval(() => {
      if (isPlaying) spawnFruit();
    }, 1200);
  }

  function checkSlices(x, y) {
    fruits.forEach(f => {
      if (!f.sliced) {
        let dist = Math.sqrt(Math.pow(f.x - x, 2) + Math.pow(f.y - y, 2));
        if (dist < f.radius + 10) {
          f.sliced = true;
          score += 10;
          scoreEl.textContent = `Score: ${score}`;
        }
      }
    });
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & Draw Fruits
    for (let i = fruits.length - 1; i >= 0; i--) {
      let f = fruits[i];
      f.vy += gravity;
      f.x += f.vx;
      f.y += f.vy;

      // Miss check (dropped off bottom without being sliced)
      if (f.y > canvas.height + 50) {
        if (!f.sliced) {
          misses++;
          if (misses >= 3) {
            gameOver();
            return;
          }
        }
        fruits.splice(i, 1);
        continue;
      }

      ctx.fillStyle = f.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = f.color;

      if (!f.sliced) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw sliced halves falling apart
        ctx.fillRect(f.x - f.radius, f.y - 5, f.radius - 2, 10);
        ctx.fillRect(f.x + 2, f.y - 5, f.radius - 2, 10);
      }
      ctx.shadowBlur = 0;
    }

    // Draw Slash Trail
    if (slashTrail.length > 1) {
      ctx.strokeStyle = '#a288ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(slashTrail[0].x, slashTrail[0].y);
      for (let i = 1; i < slashTrail.length; i++) {
        ctx.lineTo(slashTrail[i].x, slashTrail[i].y);
      }
      ctx.stroke();
    }

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    clearInterval(window.fruitSpawnTimer);
    msgEl.textContent = `3 FRUITS DROPPED. GAME OVER. Final Score: ${score}`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});