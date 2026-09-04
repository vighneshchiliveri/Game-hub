document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('word-board');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  const WORDS = ["GAMES", "PIXEL", "BOARD", "RETRO", "SPACE", "LASER", "ALIEN", "SCORE", "BLOCK"];
  let targetWord = "";
  let currentRow = 0;
  let currentTile = 0;
  let isGameOver = false;

  function initGame() {
    boardEl.innerHTML = '';
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;
    msgEl.textContent = "";

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        let tile = document.createElement('div');
        tile.classList.add('letter-box');
        tile.id = `tile-${r}-${c}`;
        boardEl.appendChild(tile);
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    if (e.key === 'Backspace') {
      if (currentTile > 0) {
        currentTile--;
        let tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = '';
        tile.classList.remove('active');
      }
    } else if (e.key === 'Enter') {
      if (currentTile === 5) checkRow();
      else { msgEl.textContent = "Not enough letters"; setTimeout(() => msgEl.textContent="", 2000); }
    } else if (/^[a-zA-Z]$/.test(e.key) && currentTile < 5) {
      let tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
      tile.textContent = e.key.toUpperCase();
      tile.classList.add('active');
      currentTile++;
    }
  });

  function checkRow() {
    let guess = "";
    for (let i = 0; i < 5; i++) {
      guess += document.getElementById(`tile-${currentRow}-${i}`).textContent;
    }

    let targetArray = targetWord.split('');
    let guessArray = guess.split('');

    // Check Correct (Green)
    for (let i = 0; i < 5; i++) {
      let tile = document.getElementById(`tile-${currentRow}-${i}`);
      if (guessArray[i] === targetArray[i]) {
        tile.classList.add('correct');
        targetArray[i] = null; // Mark handled
        guessArray[i] = null;
      }
    }

    // Check Present (Yellow) / Absent (Gray)
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === null) continue; // Already marked correct
      
      let tile = document.getElementById(`tile-${currentRow}-${i}`);
      if (targetArray.includes(guessArray[i])) {
        tile.classList.add('present');
        targetArray[targetArray.indexOf(guessArray[i])] = null; // Handle duplicates correctly
      } else {
        tile.classList.add('absent');
      }
    }

    if (guess === targetWord) {
      msgEl.textContent = "BRILLIANT!";
      msgEl.style.color = "var(--teal)";
      isGameOver = true;
    } else if (currentRow === 5) {
      msgEl.textContent = `GAME OVER. Word was ${targetWord}`;
      msgEl.style.color = "#ef4444";
      isGameOver = true;
    } else {
      currentRow++;
      currentTile = 0;
    }
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});