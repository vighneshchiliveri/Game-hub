document.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  const birdElement = document.getElementById('bird');
  const scoreElement = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const messageElement = document.getElementById('game-message');

  let birdY = 220;
  let birdVelocity = 0;
  let gravity = 0.4;
  let jumpStrength = -6.5;
  let score = 0;
  
  let pipes = [];
  let pipeWidth = 50;
  let pipeGap = 140;
  let pipeSpeed = 2.5;
  let frameCount = 0;

  let gameLoop;
  let isGameOver = true;

  function initGame() {
    // Reset variables
    birdY = gameArea.clientHeight / 2;
    birdVelocity = 0;
    score = 0;
    pipes = [];
    frameCount = 0;
    isGameOver = false;

    // Reset UI
    scoreElement.textContent = `Score: 0`;
    messageElement.textContent = '';
    birdElement.style.top = `${birdY}px`;
    birdElement.style.transform = `rotate(0deg)`;
    resetBtn.textContent = 'Restart Game';
    
    // Clear old pipes
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

    // Start loop
    cancelAnimationFrame(gameLoop);
    update();
  }

  function flap() {
    if (isGameOver) return;
    birdVelocity = jumpStrength;
  }

  function createPipe() {
    const areaHeight = gameArea.clientHeight;
    const minPipeHeight = 50;
    const maxPipeHeight = areaHeight - pipeGap - minPipeHeight;
    const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
    const bottomHeight = areaHeight - topHeight - pipeGap;

    const pipeTop = document.createElement('div');
    pipeTop.classList.add('pipe');
    pipeTop.style.top = '0';
    pipeTop.style.height = `${topHeight}px`;
    pipeTop.style.left = `${gameArea.clientWidth}px`;

    const pipeBottom = document.createElement('div');
    pipeBottom.classList.add('pipe');
    pipeBottom.style.bottom = '0';
    pipeBottom.style.height = `${bottomHeight}px`;
    pipeBottom.style.left = `${gameArea.clientWidth}px`;

    gameArea.appendChild(pipeTop);
    gameArea.appendChild(pipeBottom);

    pipes.push({
      x: gameArea.clientWidth,
      topElement: pipeTop,
      bottomElement: pipeBottom,
      passed: false
    });
  }

  function update() {
    if (isGameOver) return;

    // Physics
    birdVelocity += gravity;
    birdY += birdVelocity;
    birdElement.style.top = `${birdY}px`;

    // Bird rotation based on velocity
    let rotation = Math.min((birdVelocity / 8) * 45, 90);
    birdElement.style.transform = `rotate(${rotation}deg)`;

    // Check boundary collisions
    if (birdY < 0 || birdY + birdElement.clientHeight > gameArea.clientHeight) {
      endGame();
      return;
    }

    // Pipe logic
    if (frameCount % 100 === 0) {
      createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      let p = pipes[i];
      p.x -= pipeSpeed;
      p.topElement.style.left = `${p.x}px`;
      p.bottomElement.style.left = `${p.x}px`;

      // Collision detection
      let birdRect = birdElement.getBoundingClientRect();
      let topRect = p.topElement.getBoundingClientRect();
      let bottomRect = p.bottomElement.getBoundingClientRect();

      // Shrink bird hitbox slightly for fairer gameplay
      let hitboxShrink = 6; 
      
      if (
        (birdRect.right - hitboxShrink > topRect.left &&
         birdRect.left + hitboxShrink < topRect.right &&
         birdRect.top + hitboxShrink < topRect.bottom) ||
        (birdRect.right - hitboxShrink > bottomRect.left &&
         birdRect.left + hitboxShrink < bottomRect.right &&
         birdRect.bottom - hitboxShrink > bottomRect.top)
      ) {
        endGame();
        return;
      }

      // Score update
      if (!p.passed && p.x + pipeWidth < 50) {
        p.passed = true;
        score++;
        scoreElement.textContent = `Score: ${score}`;
      }

      // Remove off-screen pipes
      if (p.x + pipeWidth < 0) {
        p.topElement.remove();
        p.bottomElement.remove();
        pipes.splice(i, 1);
      }
    }

    frameCount++;
    gameLoop = requestAnimationFrame(update);
  }

  function endGame() {
    isGameOver = true;
    messageElement.innerHTML = `Game Over! <span style="color: var(--text);">Final Score: ${score}</span>`;
  }

  // Input listeners
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  });

  gameArea.addEventListener('mousedown', flap);
  gameArea.addEventListener('touchstart', (e) => {
    e.preventDefault(); // prevent zoom/scroll
    flap();
  }, { passive: false });

  resetBtn.addEventListener('click', initGame);
});