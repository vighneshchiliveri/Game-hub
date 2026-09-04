document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('sliding-board');
  const movesEl = document.getElementById('moves-box');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  let tiles = [];
  let moves = 0;
  let isGameOver = false;

  function initGame() {
    tiles = [...Array(15).keys()].map(i => i + 1);
    tiles.push(0); // 0 represents the empty space
    
    // Shuffle tiles until solvable
    do {
      tiles.sort(() => Math.random() - 0.5);
    } while (!isSolvable(tiles) || isWin());

    moves = 0;
    isGameOver = false;
    msgEl.textContent = '';
    updateUI();
    renderBoard();
  }

  // Count inversions to check if puzzle is solvable
  function isSolvable(arr) {
    let invCount = 0;
    let grid = arr.filter(n => n !== 0);
    for (let i = 0; i < grid.length - 1; i++) {
      for (let j = i + 1; j < grid.length; j++) {
        if (grid[i] > grid[j]) invCount++;
      }
    }
    const emptyPos = arr.indexOf(0);
    const emptyRowFromBottom = 4 - Math.floor(emptyPos / 4);
    return (emptyRowFromBottom % 2 === 0) ? (invCount % 2 !== 0) : (invCount % 2 === 0);
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    tiles.forEach((val, index) => {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      if (val === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = val;
        tile.addEventListener('click', () => handleTileClick(index));
      }
      boardEl.appendChild(tile);
    });
  }

  function handleTileClick(index) {
    if (isGameOver) return;
    
    const emptyIndex = tiles.indexOf(0);
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4];
    
    // Prevent wrapping across edges
    if (emptyIndex % 4 === 0 && index === emptyIndex - 1) return;
    if ((emptyIndex + 1) % 4 === 0 && index === emptyIndex + 1) return;

    if (validMoves.includes(index)) {
      // Swap
      [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
      moves++;
      updateUI();
      renderBoard();
      
      if (isWin()) {
        isGameOver = true;
        msgEl.textContent = 'PUZZLE SOLVED!';
      }
    }
  }

  function isWin() {
    for (let i = 0; i < 14; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[15] === 0;
  }

  function updateUI() {
    movesEl.textContent = `Moves: ${moves}`;
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});