document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const turnIndicator = document.getElementById('turn-indicator');
  const resetBtn = document.getElementById('reset-btn');
  const messageElement = document.getElementById('game-message');

  const rows = 6;
  const cols = 7;
  let board = [];
  let currentPlayer = 1; 
  let gameOver = false;

  function initGame() {
    boardElement.innerHTML = '';
    messageElement.textContent = '';
    board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    currentPlayer = 1;
    gameOver = false;
    updateTurnUI();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.dataset.c = c;
        slot.addEventListener('click', () => handleSlotClick(c));
        boardElement.appendChild(slot);
      }
    }
  }

  function handleSlotClick(col) {
    if (gameOver) return;

    // Find the lowest available row in this column
    let row = -1;
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        row = r;
        break;
      }
    }

    // Column is full
    if (row === -1) return;

    // Place token
    board[row][col] = currentPlayer;
    const index = row * cols + parseInt(col);
    const slotElement = boardElement.children[index];
    
    const token = document.createElement('div');
    token.classList.add('token', currentPlayer === 1 ? 'p1' : 'p2');
    slotElement.appendChild(token);

    if (checkWin(row, col)) {
      endGame(false);
    } else if (checkDraw()) {
      endGame(true);
    } else {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      updateTurnUI();
    }
  }

  function checkWin(r, c) {
    return (
      checkDirection(r, c, 0, 1) || // Horizontal
      checkDirection(r, c, 1, 0) || // Vertical
      checkDirection(r, c, 1, 1) || // Diagonal down-right
      checkDirection(r, c, 1, -1)   // Diagonal down-left
    );
  }

  function checkDirection(r, c, rowStep, colStep) {
    let count = 1;
    count += countTokens(r, c, rowStep, colStep);
    count += countTokens(r, c, -rowStep, -colStep);
    return count >= 4;
  }

  function countTokens(r, c, rowStep, colStep) {
    let count = 0;
    let currR = r + rowStep;
    let currC = c + colStep;

    while (currR >= 0 && currR < rows && currC >= 0 && currC < cols && board[currR][currC] === currentPlayer) {
      count++;
      currR += rowStep;
      currC += colStep;
    }
    return count;
  }

  function checkDraw() {
    return board[0].every(cell => cell !== 0);
  }

  function updateTurnUI() {
    if (currentPlayer === 1) {
      turnIndicator.textContent = 'Turn: P1 (Purple)';
      turnIndicator.className = 'stat-box p1-turn';
    } else {
      turnIndicator.textContent = 'Turn: P2 (Teal)';
      turnIndicator.className = 'stat-box p2-turn';
    }
  }

  function endGame(isDraw) {
    gameOver = true;
    turnIndicator.className = 'stat-box';
    
    if (isDraw) {
      turnIndicator.textContent = 'Game Over';
      messageElement.innerHTML = `<span style="color: var(--text-muted);">It's a draw!</span>`;
    } else {
      const winnerName = currentPlayer === 1 ? 'P1 (Purple)' : 'P2 (Teal)';
      const winnerColor = currentPlayer === 1 ? 'var(--accent)' : 'var(--teal)';
      turnIndicator.textContent = 'Winner!';
      messageElement.innerHTML = `<span style="color: ${winnerColor}; font-weight: 600;">${winnerName} wins the game!</span>`;
    }
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});