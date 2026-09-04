document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('doodle-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  // Physics & Player
  const gravity = 0.35;
  const jumpStrength = -8.5;
  const playerSpeed = 5;

  let player = { x: 200, y: 300, width: 30, height: 30, dx: 0, dy: 0 };
  let platforms = [];

  let keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

  document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  });
  document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
  });

  function initPlatforms() {
    platforms = [];
    // Base platform so you don't instantly fall
    platforms.push({ x: canvas.width / 2 - 30, y: canvas.height - 50, width: 60, height: 10 });
    
    // Generate initial platforms upwards
    for (let i = 0; i < 7; i++) {
      let x = Math.random() * (canvas.width - 60);
      let y = canvas.height - 120 - (i * 85);
      platforms.push({ x: x, y: y, width: 60, height: 10 });
    }
  }

  function update() {
    if (!isPlaying) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player Horizontal Movement
    if (keys.ArrowLeft || keys.a) player.dx = -playerSpeed;
    else if (keys.ArrowRight || keys.d) player.dx = playerSpeed;
    else player.dx = 0;

    player.x += player.dx;

    // Wrap around screen
    if (player.x + player.width < 0) player.x = canvas.width;
    else if (player.x > canvas.width) player.x = -player.width;

    // Player Vertical Movement (Gravity)
    player.dy += gravity;
    player.y += player.dy;

    // Collision Detection (Only when falling)
    if (player.dy > 0) {
      platforms.forEach(p => {
        if (
          player.x < p.x + p.width &&
          player.x + player.width > p.x &&
          player.y + player.height > p.y &&
          player.y + player.height < p.y + p.height + player.dy // Prevent falling completely through in 1 frame
        ) {
          player.dy = jumpStrength;
        }
      });
    }

    // Camera Scrolling (Move platforms down if player goes high)
    if (player.y < canvas.height / 2) {
      let diff = (canvas.height / 2) - player.y;
      player.y = canvas.height / 2; // Keep player in middle
      
      score += Math.floor(diff);
      scoreEl.textContent = `Height: ${score}`;

      platforms.forEach(p => {
        p.y += diff;
      });

      // Remove platforms that went off screen and add new ones at the top
      platforms = platforms.filter(p => p.y < canvas.height);
      
      while (platforms.length < 8) {
        let highestY = Math.min(...platforms.map(p => p.y));
        platforms.push({
          x: Math.random() * (canvas.width - 60),
          y: highestY - (Math.random() * 40 + 70), // Random gap between 70 and 110
          width: 60,
          height: 10
        });
      }
    }

    // Draw Platforms
    ctx.fillStyle = "#00e5b8"; // var(--teal)
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00e5b8";
    platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Draw Player
    ctx.fillStyle = "#7c5cff"; // var(--accent)
    ctx.shadowColor = "#7c5cff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0; // Reset for performance

    // Game Over Condition
    if (player.y > canvas.height) {
      msgEl.textContent = "YOU FELL INTO THE ABYSS.";
      msgEl.style.color = "#ef4444";
      isPlaying = false;
      return;
    }

    gameLoop = requestAnimationFrame(update);
  }

  function startGame() {
    isPlaying = true;
    score = 0;
    scoreEl.textContent = `Height: 0`;
    msgEl.textContent = "";
    resetBtn.textContent = "Restart Game";
    
    player = { x: canvas.width / 2 - 15, y: canvas.height - 150, width: 30, height: 30, dx: 0, dy: 0 };
    
    initPlatforms();
    cancelAnimationFrame(gameLoop);
    update();
  }

  resetBtn.addEventListener('click', startGame);
});