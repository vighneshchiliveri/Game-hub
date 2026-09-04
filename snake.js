document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  let score = 0;
  let gameInterval;
  let isPlaying = false;

  let snake = [];
  let food = { x: 5, y: 5 };
  let dx = 1;
  let dy = 0;

  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
  });

  function startGame() {
    isPlaying = true;
    score = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Game';

    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    spawnFood();

    clearInterval(gameInterval);
    gameInterval = setInterval(update, 100);
  }

  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  }

  function update() {
    if (!isPlaying) return;

    let head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver();
      return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
        return;
      }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
      spawnFood();
    } else {
      snake.pop();
    }

    render();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Draw Snake
    ctx.fillStyle = '#00e5b8';
    ctx.shadowColor = '#00e5b8';
    snake.forEach(part => {
      ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0; // Reset
  }

  function gameOver() {
    isPlaying = false;
    clearInterval(gameInterval);
    msgEl.textContent = `COLLISION DETECTED. Final Score: ${score}`;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});