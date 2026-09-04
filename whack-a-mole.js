document.addEventListener('DOMContentLoaded', () => {
  const holes = document.querySelectorAll('.hole');
  const scoreEl = document.getElementById('score-box');
  const timeEl = document.getElementById('time-box');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  let lastHole;
  let timeUp = false;
  let score = 0;
  let timeLeft = 30;
  let countdownTimer;

  // Utility: Random time generator
  function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  // Utility: Random hole selector (prevents same hole twice in a row)
  function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
      return randomHole(holes);
    }
    lastHole = hole;
    return hole;
  }

  // Make the mole pop up
  function peep() {
    const time = randomTime(400, 1000); // Moles stay up between 0.4s and 1s
    const hole = randomHole(holes);
    hole.classList.add('up');
    
    setTimeout(() => {
      hole.classList.remove('up');
      hole.classList.remove('hit');
      if (!timeUp) peep();
    }, time);
  }

  // Handle hitting a mole
  function bonk(e) {
    // e.isTrusted prevents automated clicks via scripts
    if (!e.isTrusted) return; 
    
    if (this.classList.contains('up') && !this.classList.contains('hit')) {
      score++;
      this.classList.add('hit');
      setTimeout(() => this.classList.remove('up'), 100);
      scoreEl.textContent = `Score: ${score}`;
    }
  }

  holes.forEach(hole => hole.addEventListener('mousedown', bonk));
  holes.forEach(hole => hole.addEventListener('touchstart', bonk, {passive: true}));

  function updateTimer() {
    timeLeft--;
    timeEl.textContent = `Time: ${timeLeft}s`;
    
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      timeUp = true;
      msgEl.textContent = `TIME'S UP! Final Score: ${score}`;
      msgEl.style.color = "var(--accent)";
      resetBtn.textContent = "Play Again";
    }
  }

  function startGame() {
    score = 0;
    timeLeft = 30;
    timeUp = false;
    scoreEl.textContent = 'Score: 0';
    timeEl.textContent = 'Time: 30s';
    msgEl.textContent = "Smash the glowing orbs before they vanish!";
    msgEl.style.color = "var(--teal)";
    resetBtn.textContent = "Restart Game";
    
    // Clear any existing timer
    clearInterval(countdownTimer);
    
    // Ensure all moles are down
    holes.forEach(hole => {
      hole.classList.remove('up');
      hole.classList.remove('hit');
    });

    peep();
    countdownTimer = setInterval(updateTimer, 1000);
  }

  resetBtn.addEventListener('click', startGame);
});