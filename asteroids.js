document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('asteroids-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  let gameLoop;
  let isPlaying = false;
  let score = 0;

  const FPS = 60;
  const FRICTION = 0.7; 
  const SHIP_THRUST = 5; 
  const TURN_SPEED = 360; 
  
  let ship, roids, lasers;

  function initGame() {
    isPlaying = true;
    score = 0;
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = "";
    resetBtn.textContent = "Restart Game";
    
    ship = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      r: 10,
      a: 90 / 180 * Math.PI, 
      rot: 0,
      thrusting: false,
      thrust: { x: 0, y: 0 }
    };

    roids = [];
    lasers = [];
    createAsteroids(5);
    
    cancelAnimationFrame(gameLoop);
    update();
  }

  function createAsteroids(num) {
    for (let i = 0; i < num; i++) {
      let x, y;
      do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
      } while (distBetweenPoints(ship.x, ship.y, x, y) < 100);
      roids.push(newAsteroid(x, y, 40));
    }
  }

  function newAsteroid(x, y, r) {
    return {
      x: x, y: y,
      xv: Math.random() * 2 - 1,
      yv: Math.random() * 2 - 1,
      r: r,
      a: Math.random() * Math.PI * 2,
      vert: Math.floor(Math.random() * 5 + 5),
      offs: Array.from({length: 10}, () => Math.random() * 0.4 + 0.8)
    };
  }

  function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  function shootLaser() {
    if (lasers.length < 10) {
      lasers.push({
        x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
        xv: 10 * Math.cos(ship.a),
        yv: -10 * Math.sin(ship.a),
        dist: 0
      });
    }
  }

  document.addEventListener("keydown", (e) => {
    if (!isPlaying) return;
    if (e.code === "ArrowLeft") ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
    if (e.code === "ArrowRight") ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
    if (e.code === "ArrowUp") ship.thrusting = true;
    if (e.code === "Space") shootLaser();
  });

  document.addEventListener("keyup", (e) => {
    if (!isPlaying) return;
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") ship.rot = 0;
    if (e.code === "ArrowUp") ship.thrusting = false;
  });

  function update() {
    if (!isPlaying) return;

    // Draw Space
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Thrust
    if (ship.thrusting) {
      ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
      ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
      ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
      ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // Draw Ship
    ctx.strokeStyle = "#00e5b8"; // var(--teal)
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
      ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo(
      ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
      ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo(
      ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
      ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // Move Ship
    ship.a += ship.rot;
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // Handle Edge Screen Wrap
    if (ship.x < 0 - ship.r) ship.x = canvas.width + ship.r;
    else if (ship.x > canvas.width + ship.r) ship.x = 0 - ship.r;
    if (ship.y < 0 - ship.r) ship.y = canvas.height + ship.r;
    else if (ship.y > canvas.height + ship.r) ship.y = 0 - ship.r;

    // Move and Draw Lasers
    ctx.fillStyle = "#7c5cff"; // var(--accent)
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].x += lasers[i].xv;
      lasers[i].y += lasers[i].yv;
      lasers[i].dist += Math.sqrt(Math.pow(lasers[i].xv, 2) + Math.pow(lasers[i].yv, 2));

      if (lasers[i].x < 0) lasers[i].x = canvas.width;
      else if (lasers[i].x > canvas.width) lasers[i].x = 0;
      if (lasers[i].y < 0) lasers[i].y = canvas.height;
      else if (lasers[i].y > canvas.height) lasers[i].y = 0;

      if (lasers[i].dist > canvas.width * 0.8) {
        lasers.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(lasers[i].x, lasers[i].y, 2, 0, Math.PI * 2, false);
      ctx.fill();
    }

    // Move and Draw Asteroids
    ctx.strokeStyle = "#a288ff";
    for (let i = 0; i < roids.length; i++) {
      let a = roids[i];
      a.x += a.xv;
      a.y += a.yv;

      if (a.x < 0 - a.r) a.x = canvas.width + a.r;
      else if (a.x > canvas.width + a.r) a.x = 0 - a.r;
      if (a.y < 0 - a.r) a.y = canvas.height + a.r;
      else if (a.y > canvas.height + a.r) a.y = 0 - a.r;

      ctx.beginPath();
      for (let j = 0; j < a.vert; j++) {
        ctx.lineTo(
          a.x + a.r * a.offs[j] * Math.cos(a.a + j * Math.PI * 2 / a.vert),
          a.y + a.r * a.offs[j] * Math.sin(a.a + j * Math.PI * 2 / a.vert)
        );
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Detect Collisions (Lasers vs Asteroids)
    for (let i = roids.length - 1; i >= 0; i--) {
      let a = roids[i];
      let ax = a.x, ay = a.y, ar = a.r;
      for (let j = lasers.length - 1; j >= 0; j--) {
        if (distBetweenPoints(ax, ay, lasers[j].x, lasers[j].y) < ar) {
          lasers.splice(j, 1);
          score += (ar === 40) ? 20 : (ar === 20) ? 50 : 100;
          scoreEl.textContent = `Score: ${score}`;
          
          if (ar === 40) {
            roids.push(newAsteroid(ax, ay, 20));
            roids.push(newAsteroid(ax, ay, 20));
          } else if (ar === 20) {
            roids.push(newAsteroid(ax, ay, 10));
            roids.push(newAsteroid(ax, ay, 10));
          }
          roids.splice(i, 1);
          break; 
        }
      }
    }

    // Detect Ship Collision
    for (let i = 0; i < roids.length; i++) {
      if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
        msgEl.textContent = "HULL BREACH. GAME OVER.";
        msgEl.style.color = "#ef4444";
        isPlaying = false;
        return;
      }
    }

    // Win condition (if all cleared)
    if (roids.length === 0) {
      createAsteroids(5 + Math.floor(score/1000)); // Level up
    }

    gameLoop = requestAnimationFrame(update);
  }

  resetBtn.addEventListener('click', initGame);
});