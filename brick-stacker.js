document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('stacker-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  const blockHeight = 25;
  let currentWidth = 120;
  let currentX = 140;
  let swingSpeed = 4;
  let stack = [];

  const groundY = 450;

  function dropBlock() {
    if (!isPlaying) return;

    let targetY = groundY - (stack.length + 1) * blockHeight;
    
    // If there is a previous block, trim width by overhang offset
    if (stack.length > 0) {
      let prev = stack[stack.length - 1];
      let overlapLeft = Math.max(currentX, prev.x);
      let overlapRight = Math.min(currentX + currentWidth, prev.x + prev.width);
      let newWidth = overlapRight - overlapLeft;

      if (newWidth <= 0) {
        gameOver();
        return;
      }

      currentX = overlapLeft;
      currentWidth = newWidth;
    }

    stack.push({ x: currentX, y: targetY, width: currentWidth, height: blockHeight });
    score++;
    scoreEl.textContent = `Tower: ${score}`;

    // Reset for next swing higher up
    currentX = 50;
    swingSpeed += 0.3; // increase difficulty

    if (stack.length * blockHeight >= canvas.height - 80) {
      // Scroll stack down or win round
      stack.forEach(b => b.y += blockHeight);
      stack.shift();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      dropBlock();
    }
  });

  canvas.addEventListener('click', dropBlock);

  function startGame() {
    isPlaying = true;
    score = 0;
    currentWidth = 120;
    currentX = 140;
    swingSpeed = 4;
    stack = [];
    scoreEl.textContent = `Tower: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Swing current moving block horizontally
    currentX += swingSpeed;
    if (currentX <= 0 || currentX + currentWidth >= canvas.width) {
      swingSpeed = -swingSpeed;
    }

    let targetY = groundY - stack.length * blockHeight;

    // Draw stacked blocks
    ctx.fillStyle = '#00e5b8';
    stack.forEach(b => {
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Draw currently active swinging block
    ctx.fillStyle = '#7c5cff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#7c5cff';
    ctx.fillRect(currentX, targetY, currentWidth, blockHeight);
    ctx.shadowBlur = 0;

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver() {
    isPlaying = false;
    msgEl.textContent = `TOWER COLLAPSED. Final Score: ${score}`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});