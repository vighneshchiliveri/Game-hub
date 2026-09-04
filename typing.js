document.addEventListener('DOMContentLoaded', () => {
  const arena = document.getElementById('words-container');
  const input = document.getElementById('word-input');
  const scoreEl = document.getElementById('score-box');
  const resetBtn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('game-message');

  const wordBank = [
    "cyber", "neon", "matrix", "synth", "glitch", "arcade", 
    "quantum", "laser", "pixel", "grid", "token", "shield", 
    "vector", "pulse", "socket", "binary", "packet", "kernel"
  ];

  let activeWords = [];
  let score = 0;
  let isPlaying = false;
  let gameInterval, spawnInterval;

  function startGame() {
    score = 0;
    activeWords = [];
    scoreEl.textContent = `Score: 0`;
    msgEl.textContent = '';
    isPlaying = true;
    resetBtn.textContent = 'Restart Game';
    input.disabled = false;
    input.value = '';
    input.focus();

    arena.innerHTML = '';
    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    spawnInterval = setInterval(spawnWord, 2000);
    gameInterval = setInterval(updateWords, 50);
  }

  function spawnWord() {
    if (!isPlaying) return;
    let wordText = wordBank[Math.floor(Math.random() * wordBank.length)];
    // Ensure no duplicate active words
    if (activeWords.some(w => w.text === wordText)) return;

    let wordObj = {
      text: wordText,
      x: Math.random() * 320, // Keep within arena width bounds
      y: 0,
      speed: 1.2 + Math.random() * 0.8
    };

    activeWords.push(wordObj);
  }

  function updateWords() {
    if (!isPlaying) return;

    arena.innerHTML = '';
    for (let i = activeWords.length - 1; i >= 0; i--) {
      let w = activeWords[i];
      w.y += w.speed;

      // Bottom collision check (Game Over)
      if (w.y > 310) {
        gameOver("BREACH DETECTED. GAME OVER.");
        return;
      }

      // Render word element
      let el = document.createElement('div');
      el.className = 'falling-word';
      el.textContent = w.text;
      el.style.left = `${w.x}px`;
      el.style.top = `${w.y}px`;
      arena.appendChild(el);
    }
  }

  input.addEventListener('input', (e) => {
    if (!isPlaying) return;
    let typedVal = e.target.value.trim().toLowerCase();

    let index = activeWords.findIndex(w => w.text === typedVal);
    if (index !== -1) {
      // Match found!
      activeWords.splice(index, 1);
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
      input.value = '';
    }
  });

  function gameOver(reason) {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    input.disabled = true;
    msgEl.textContent = reason;
    msgEl.style.color = "#ef4444";
  }

  resetBtn.addEventListener('click', startGame);
});