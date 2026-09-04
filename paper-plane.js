document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('plane-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let altitude = 0;

  let plane = {
    x: 100, y: 200,
    speed: 3,
    angle: 0
  };

  let rings = [];
  let ringTimer = 0;

  let keys = { ArrowUp: false, ArrowDown: false };

  document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  });
  document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
  });

  function startGame() {
    isPlaying = true;
    altitude = 0;
    rings = [];
    ringTimer = 0;
    plane = { x: 100, y: 200, speed: 3, angle: 0 };
    scoreEl.textContent = `Altitude: 0m`;
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Glide';

    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Controls
    if (keys.ArrowUp) plane.angle -= 0.03;
    if (keys.ArrowDown) plane.angle += 0.03;

    // Clamp pitch angle
    plane.angle = Math.max(-0.6, Math.min(0.6, plane.angle));

    // Physics
    plane.y += Math.sin(plane.angle) * plane.speed + 0.4; // natural gravity sink
    altitude += 1;
    scoreEl.textContent = `Altitude: ${altitude}m`;

    // Spawn Ring Obstacles / Targets
    ringTimer++;
    if (ringTimer > 90) {
      ringTimer = 0;
      rings.push({
        x: canvas.width + 50,
        y: Math.random() * 250 + 70,
        radius: 30,
        passed: false
      });
    }

    // Move & Draw Rings
    ctx.strokeStyle = '#00e5b8';
    ctx.lineWidth = 3;
    for (let i = rings.length - 1; i >= 0; i--) {
      let r = rings[i];
      r.x -= plane.speed;

      if (r.x < -50) {
        rings.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Collision / Scoring Check
      let dist = Math.sqrt(Math.pow(plane.x - r.x, 2) + Math.pow(plane.y - r.y, 2));
      if (dist < r.radius + 10 && !r.passed) {
        r.passed = true;
        altitude += 50; // Bonus altitude for passing through rings
      }
    }

    // Boundary Collisions
    if (plane.y < 0 || plane.y > canvas.height) {
      gameOver("STALLED. GROUND IMPACT.");
      return;
    }

    // Draw Paper Plane
    ctx.save();
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle);
    ctx.fillStyle = '#7c5cff';
    ctx.strokeStyle = '#a288ff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-12, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    gameLoop = requestAnimationFrame(update);
  }

  function gameOver(reason) {
    isPlaying = false;
    msgEl.textContent = reason;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});