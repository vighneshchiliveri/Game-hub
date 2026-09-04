document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('lander-canvas');
  const ctx = canvas.getContext('2d');
  const fuelEl = document.getElementById('fuel-box');
  const speedEl = document.getElementById('speed-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;

  let lander = {
    x: 300, y: 50,
    vx: 0, vy: 0,
    angle: 0, // in radians
    fuel: 100
  };

  const gravity = 0.04;
  const thrustPower = 0.08;
  const rotationSpeed = 0.03;

  let keys = { ArrowUp: false, ArrowLeft: false, ArrowRight: false };

  document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  });
  document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
  });

  // Flat landing pad zone between x: 250 and 350 at y: 350
  const landingPad = { x1: 250, x2: 350, y: 350 };

  function startGame() {
    isPlaying = true;
    lander = { x: 300, y: 50, vx: (Math.random() - 0.5) * 1, vy: 0, angle: 0, fuel: 100 };
    msgEl.textContent = '';
    resetBtn.textContent = 'Restart Flight';
    cancelAnimationFrame(gameLoop);
    update();
  }

  function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Controls
    if (keys.ArrowLeft) lander.angle -= rotationSpeed;
    if (keys.ArrowRight) lander.angle += rotationSpeed;
    if (keys.ArrowUp && lander.fuel > 0) {
      lander.vx += Math.sin(lander.angle) * thrustPower;
      lander.vy -= Math.cos(lander.angle) * thrustPower;
      lander.fuel -= 0.2;
      fuelEl.textContent = `Fuel: ${Math.max(0, Math.floor(lander.fuel))}%`;
    }

    // Gravity & Physics
    lander.vy += gravity;
    lander.x += lander.vx;
    lander.y += lander.vy;

    let currentSpeed = Math.sqrt(lander.vx * lander.vx + lander.vy * lander.vy);
    speedEl.textContent = `Speed: ${currentSpeed.toFixed(1)}`;

    // Draw Terrain
    ctx.strokeStyle = '#7c5cff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(250, 350); // Flat landing pad
    ctx.lineTo(350, 350);
    ctx.lineTo(600, 370);
    ctx.lineTo(600, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.stroke();

    // Highlight Landing Pad
    ctx.strokeStyle = '#00e5b8';
    ctx.beginPath();
    ctx.moveTo(250, 350);
    ctx.lineTo(350, 350);
    ctx.stroke();

    // Draw Lander
    ctx.save();
    ctx.translate(lander.x, lander.y);
    ctx.rotate(lander.angle);
    ctx.strokeStyle = '#00e5b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -15, 20, 30);
    
    // Thruster flame if firing
    if (keys.ArrowUp && lander.fuel > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-6, 15);
      ctx.lineTo(0, 25);
      ctx.lineTo(6, 15);
      ctx.fill();
    }
    ctx.restore();

    // Collision Checks
    // Ground level check
    if (lander.y >= 350 - 15) {
      isPlaying = false;
      let onPad = lander.x >= landingPad.x1 && lander.x <= landingPad.x2;
      let safeSpeed = currentSpeed < 1.5;
      let upright = Math.abs(lander.angle) < 0.15;

      if (onPad && safeSpeed && upright) {
        msgEl.textContent = "SUCCESSFUL TOUCHDOWN. PERFECT LANDING.";
        msgEl.style.color = "var(--accent)";
      } else {
        msgEl.textContent = "CRASH LANDING. HULL DESTROYED.";
        msgEl.style.color = "#ef4444";
      }
      return;
    }

    // Side screen bounds wrap or fail
    if (lander.x < 0 || lander.x > canvas.width) {
      isPlaying = false;
      msgEl.textContent = "DRIFTED INTO DEEP SPACE.";
      msgEl.style.color = "#ef4444";
      return;
    }

    gameLoop = requestAnimationFrame(update);
  }

  resetBtn.addEventListener('click', startGame);
});