document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('lights-board');
  const movesEl = document.getElementById('moves-box');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  const size = 5;
  let grid = [];
  let moves = 0;
  let isWon = false;

  function initGame() {
    moves = 0;
    isWon = false;
    movesEl.textContent = `Moves: 0`;
    msgEl.textContent = '';
    
    // Initialize empty grid (all off)
    grid = Array.from({ length: size }, () => Array(size).fill(false));

    // Randomize by making valid random toggles to ensure solvability
    for (let i = 0; i < 6; i++) {
      let r = Math.floor(Math.random() * size);
      let c = Math.floor(Math.random() * size);
      toggleCellState(r, c);
    }

    // Ensure at least some lights are on
    let onCount = grid.flat().filter(Boolean).length;
    if (onCount === 0) {
      toggleCellState(2, 2);
    }

    renderBoard();
  }

  function toggleCellState(r, c) {
    const coords = [
      [r, c],
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1]
    ];
    coords.forEach(([row, col]) => {
      if (row >= 0 && row < size && col >= 0 && col < size) {
        grid[row][col] = !grid[row][col];
      }
    });
  }

  function handleCellClick(r, c) {
    if (isWon) return;

    toggleCellState(r, c);
    moves++;
    movesEl.textContent = `Moves: ${moves}`;
    renderBoard();
    checkWin();
  }

  function renderBoard() {
    board.innerHTML = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'light-cell';
        if (grid[r][c]) {
          cell.classList.add('on');
        }
        cell.addEventListener('click', () => handleCellClick(r, c));
        board.appendChild(cell);
      }
    }
  }

  function checkWin() {
    const allOff = grid.flat().every(val => !val);
    if (allOff) {
      isWon = true;
      msgEl.textContent = `SYSTEM CLEAR IN ${moves} MOVES!`;
      msgEl.style.color = "var(--accent)";
    }
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});