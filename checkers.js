document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('checkers-board');
  const turnMsg = document.getElementById('turn-message');
  const resetBtn = document.getElementById('reset-btn');

  const ROWS = 8;
  const COLS = 8;
  let board = []; // 0=empty, 1=teal, 2=purple, 3=tealKing, 4=purpleKing
  let turn = 1; // 1 = Teal, 2 = Purple
  let selectedPiece = null;
  let validMoves = [];

  function initBoard() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) board[r][c] = 2; // Purple at top
          if (r > 4) board[r][c] = 1; // Teal at bottom
        }
      }
    }
    turn = 1;
    selectedPiece = null;
    validMoves = [];
    updateUI();
  }

  function getValidMoves(r, c, pieceType) {
    const moves = [];
    const isTeal = pieceType === 1 || pieceType === 3;
    const isKing = pieceType === 3 || pieceType === 4;
    
    const directions = [];
    if (isTeal || isKing) directions.push([-1, -1], [-1, 1]); // Move up
    if (!isTeal || isKing) directions.push([1, -1], [1, 1]);  // Move down

    directions.forEach(([dr, dc]) => {
      // Regular move
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === 0) {
        moves.push({ r: nr, c: nc, type: 'move' });
      }
      // Jump move
      let jr = r + dr * 2, jc = c + dc * 2;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] !== 0) {
        const isEnemy = isTeal ? (board[nr][nc] === 2 || board[nr][nc] === 4) : (board[nr][nc] === 1 || board[nr][nc] === 3);
        if (isEnemy && jr >= 0 && jr < ROWS && jc >= 0 && jc < COLS && board[jr][jc] === 0) {
          moves.push({ r: jr, c: jc, type: 'jump', jumpedR: nr, jumpedC: nc });
        }
      }
    });
    return moves;
  }

  function handleCellClick(r, c) {
    const piece = board[r][c];
    const isCurrentPlayerPiece = (turn === 1 && (piece === 1 || piece === 3)) || (turn === 2 && (piece === 2 || piece === 4));

    if (isCurrentPlayerPiece) {
      selectedPiece = { r, c };
      validMoves = getValidMoves(r, c, piece);
      updateUI();
    } else if (selectedPiece) {
      const move = validMoves.find(m => m.r === r && m.c === c);
      if (move) {
        executeMove(move);
      } else {
        selectedPiece = null;
        validMoves = [];
        updateUI();
      }
    }
  }

  function executeMove(move) {
    const piece = board[selectedPiece.r][selectedPiece.c];
    board[selectedPiece.r][selectedPiece.c] = 0;
    
    let newPiece = piece;
    // Kinging
    if (piece === 1 && move.r === 0) newPiece = 3;
    if (piece === 2 && move.r === 7) newPiece = 4;
    board[move.r][move.c] = newPiece;

    let jumpAvailable = false;
    if (move.type === 'jump') {
      board[move.jumpedR][move.jumpedC] = 0; // Remove jumped piece
      // Check for double jump
      const furtherMoves = getValidMoves(move.r, move.c, newPiece).filter(m => m.type === 'jump');
      if (furtherMoves.length > 0) {
        jumpAvailable = true;
        selectedPiece = { r: move.r, c: move.c };
        validMoves = furtherMoves;
      }
    }

    if (!jumpAvailable) {
      turn = turn === 1 ? 2 : 1;
      selectedPiece = null;
      validMoves = [];
      checkWin();
    }
    
    updateUI();
  }

  function checkWin() {
    let tealCount = 0, purpleCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === 1 || board[r][c] === 3) tealCount++;
        if (board[r][c] === 2 || board[r][c] === 4) purpleCount++;
      }
    }
    if (tealCount === 0) turnMsg.textContent = "PURPLE WINS!";
    else if (purpleCount === 0) turnMsg.textContent = "TEAL WINS!";
    else {
      turnMsg.textContent = turn === 1 ? "Teal's Turn (Bottom)" : "Purple's Turn (Top)";
      turnMsg.style.color = turn === 1 ? "var(--teal)" : "var(--accent)";
    }
  }

  function updateUI() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.classList.add('checkers-cell', (r + c) % 2 === 1 ? 'dark' : 'light');
        
        // Highlight valid moves
        if (validMoves.some(m => m.r === r && m.c === c)) {
          cell.classList.add('highlight');
        }

        cell.addEventListener('click', () => handleCellClick(r, c));

        if (board[r][c] !== 0) {
          const pieceEl = document.createElement('div');
          pieceEl.classList.add('checker-piece');
          if (board[r][c] === 1 || board[r][c] === 3) pieceEl.classList.add('teal');
          if (board[r][c] === 2 || board[r][c] === 4) pieceEl.classList.add('purple');
          if (board[r][c] === 3 || board[r][c] === 4) pieceEl.textContent = '👑';
          
          if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
            pieceEl.classList.add('selected');
          }
          cell.appendChild(pieceEl);
        }
        boardEl.appendChild(cell);
      }
    }
  }

  resetBtn.addEventListener('click', initBoard);
  initBoard();
});