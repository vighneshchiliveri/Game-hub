document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const mineCounterElement = document.getElementById('mine-counter');
  const timerElement = document.getElementById('timer');
  const resetBtn = document.getElementById('reset-btn');
  const messageElement = document.getElementById('game-message');

  const rows = 10;
  const cols = 10;
  const totalMines = 10;

  let board = [];
  let mines = [];
  let flags = 0;
  let gameOver = false;
  let cellsRevealed = 0;
  let timerInterval;
  let seconds = 0;
  let firstClick = true;

  function initGame() {
    boardElement.innerHTML = '';
    messageElement.textContent = '';
    board = [];
    mines = [];
    flags = 0;
    gameOver = false;
    cellsRevealed = 0;
    seconds = 0;
    firstClick = true;
    updateMineCounter();
    updateTimerDisplay();
    clearInterval(timerInterval);

    // Create logical board & UI cells
    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < cols; c++) {
        let cellData = { r, c, isMine: false, isRevealed: false, isFlagged: false };
        row.push(cellData);

        let cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.r = r;
        cellElement.dataset.c = c;
        
        cellElement.addEventListener('click', () => handleCellClick(r, c));
        cellElement.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handleRightClick(r, c);
        });

        boardElement.appendChild(cellElement);
      }
      board.push(row);
    }
  }

  function placeMines(firstR, firstC) {
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      
      // Don't place mine on first click or where a mine already exists
      if (!board[r][c].isMine && (r !== firstR || c !== firstC)) {
        board[r][c].isMine = true;
        mines.push({ r, c });
        minesPlaced++;
      }
    }
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    timerElement.textContent = `⏱️ ${seconds.toString().padStart(3, '0')}`;
  }

  function updateMineCounter() {
    mineCounterElement.textContent = `💣 ${totalMines - flags}`;
  }

  function getCellElement(r, c) {
    return document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
  }

  function handleCellClick(r, c) {
    if (gameOver || board[r][c].isRevealed || board[r][c].isFlagged) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTimer();
    }

    if (board[r][c].isMine) {
      triggerGameOver(false);
      return;
    }

    revealCell(r, c);
    checkWin();
  }

  function handleRightClick(r, c) {
    if (gameOver || board[r][c].isRevealed) return;

    let cellData = board[r][c];
    let cellElement = getCellElement(r, c);

    if (!cellData.isFlagged && flags < totalMines) {
      cellData.isFlagged = true;
      cellElement.textContent = '🚩';
      flags++;
    } else if (cellData.isFlagged) {
      cellData.isFlagged = false;
      cellElement.textContent = '';
      flags--;
    }
    updateMineCounter();
  }

  function revealCell(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    let cellData = board[r][c];
    if (cellData.isRevealed || cellData.isFlagged) return;

    cellData.isRevealed = true;
    cellsRevealed++;
    
    let cellElement = getCellElement(r, c);
    cellElement.classList.add('revealed');

    let adjacentMines = countAdjacentMines(r, c);
    
    if (adjacentMines > 0) {
      cellElement.textContent = adjacentMines;
      cellElement.dataset.num = adjacentMines;
    } else {
      // Flood fill if 0 adjacent mines
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(r + i, c + j);
        }
      }
    }
  }

  function countAdjacentMines(r, c) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let newR = r + i;
        let newC = c + j;
        if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
          if (board[newR][newC].isMine) count++;
        }
      }
    }
    return count;
  }

  function triggerGameOver(isWin) {
    gameOver = true;
    clearInterval(timerInterval);

    if (isWin) {
      messageElement.innerHTML = `<span style="color: var(--teal);">Mission Accomplished! Cleared in ${seconds}s.</span>`;
    } else {
      messageElement.innerHTML = `<span style="color: #ef4444;">Boom! Game Over.</span>`;
      // Reveal all mines
      mines.forEach(mine => {
        let cellElement = getCellElement(mine.r, mine.c);
        cellElement.classList.add('revealed', 'mine');
        cellElement.textContent = '💣';
      });
    }
  }

  function checkWin() {
    if (cellsRevealed === (rows * cols) - totalMines) {
      triggerGameOver(true);
    }
  }

  resetBtn.addEventListener('click', initGame);

  // Start the first game
  initGame();
});