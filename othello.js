document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('othello-board');
  const p1ScoreEl = document.getElementById('p1-score');
  const p2ScoreEl = document.getElementById('p2-score');
  const turnMsg = document.getElementById('turn-message');
  const resetBtn = document.getElementById('reset-btn');

  let board = [];
  let currentPlayer = 1; // 1 = Purple, 2 = Teal
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  function initGame() {
    board = Array(8).fill(null).map(() => Array(8).fill(0));
    board[3][3] = 2; board[4][4] = 2;
    board[3][4] = 1; board[4][3] = 1;
    
    currentPlayer = 1;
    updateUI();
  }

  function getFlips(row, col, player) {
    if (board[row][col] !== 0) return [];
    
    let flips = [];
    const opponent = player === 1 ? 2 : 1;

    directions.forEach(([dr, dc]) => {
      let r = row + dr;
      let c = col + dc;
      let potentialFlips = [];

      while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
        potentialFlips.push({r, c});
        r += dr; c += dc;
      }

      if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player && potentialFlips.length > 0) {
        flips.push(...potentialFlips);
      }
    });

    return flips;
  }

  function getValidMoves(player) {
    let moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (getFlips(r, c, player).length > 0) moves.push({r, c});
      }
    }
    return moves;
  }

  function placeDisk(row, col) {
    const flips = getFlips(row, col, currentPlayer);
    if (flips.length === 0) return;

    board[row][col] = currentPlayer;
    flips.forEach(f => board[f.r][f.c] = currentPlayer);

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    // Check if next player has moves, if not, skip turn
    if (getValidMoves(currentPlayer).length === 0) {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      if (getValidMoves(currentPlayer).length === 0) {
        endGame();
        return;
      }
    }
    updateUI();
  }

  function updateUI() {
    boardEl.innerHTML = '';
    let p1Count = 0, p2Count = 0;
    const validMoves = getValidMoves(currentPlayer);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.classList.add('othello-cell');
        
        if (board[r][c] === 1) {
          p1Count++;
          const disk = document.createElement('div');
          disk.classList.add('disk', 'p1');
          cell.appendChild(disk);
        } else if (board[r][c] === 2) {
          p2Count++;
          const disk = document.createElement('div');
          disk.classList.add('disk', 'p2');
          cell.appendChild(disk);
        } else if (validMoves.some(m => m.r === r && m.c === c)) {
          cell.classList.add('valid');
          cell.addEventListener('click', () => placeDisk(r, c));
        }

        boardEl.appendChild(cell);
      }
    }

    p1ScoreEl.textContent = `Purple: ${p1Count}`;
    p2ScoreEl.textContent = `Teal: ${p2Count}`;
    
    turnMsg.textContent = currentPlayer === 1 ? "Purple's Turn" : "Teal's Turn";
    turnMsg.style.color = currentPlayer === 1 ? "var(--accent)" : "var(--teal)";
  }

  function endGame() {
    updateUI();
    let p1 = parseInt(p1ScoreEl.textContent.split(': ')[1]);
    let p2 = parseInt(p2ScoreEl.textContent.split(': ')[1]);
    
    if (p1 > p2) {
      turnMsg.textContent = "PURPLE WINS!";
      turnMsg.style.color = "var(--accent)";
    } else if (p2 > p1) {
      turnMsg.textContent = "TEAL WINS!";
      turnMsg.style.color = "var(--teal)";
    } else {
      turnMsg.textContent = "IT'S A DRAW!";
      turnMsg.style.color = "var(--text)";
    }
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});