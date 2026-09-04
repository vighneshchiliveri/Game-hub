document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('dots-board');
  const turnEl = document.getElementById('turn-box');
  const scoreEl = document.getElementById('score-box');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  const size = 3; // 3x3 grid of boxes
  let turn = 1; // 1 or 2
  let scores = { 1: 0, 2: 0 };
  let hLines, vLines, boxes;
  let isGameOver = false;

  function initGame() {
    turn = 1;
    scores = { 1: 0, 2: 0 };
    isGameOver = false;
    msgEl.textContent = '';
    turnEl.textContent = `Turn: P1 (Teal)`;
    scoreEl.textContent = `P1: 0 | P2: 0`;

    // Initialize state arrays: hLines (3x4), vLines (4x3), boxes (3x3)
    hLines = Array.from({ length: size + 1 }, () => Array(size).fill(0));
    vLines = Array.from({ length: size }, () => Array(size + 1).fill(0));
    boxes = Array.from({ length: size }, () => Array(size).fill(0));

    renderBoard();
  }

  function renderBoard() {
    boardEl.innerHTML = '';

    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        // Dot
        const dot = document.createElement('div');
        dot.className = 'dot';
        boardEl.appendChild(dot);

        // Horizontal Line (if not last column)
        if (c < size) {
          const hLine = document.createElement('div');
          hLine.className = 'line-h';
          if (hLines[r][c] === 1) { hLine.classList.add('active', 'p1'); }
          else if (hLines[r][c] === 2) { hLine.classList.add('active', 'p2', 'p2'); }
          else {
            hLine.addEventListener('click', () => handleLineClick('h', r, c));
          }
          boardEl.appendChild(hLine);
        }
      }

      // Row of vertical lines and boxes (if not last row)
      if (r < size) {
        for (let c = 0; c <= size; c++) {
          // Vertical Line
          const vLine = document.createElement('div');
          vLine.className = 'line-v';
          if (vLines[r][c] === 1) { vLine.classList.add('active', 'p1'); }
          else if (vLines[r][c] === 2) { vLine.classList.add('active', 'p2'); }
          else {
            vLine.addEventListener('click', () => handleLineClick('v', r, c));
          }
          boardEl.appendChild(vLine);

          // Box (if not last column)
          if (c < size) {
            const box = document.createElement('div');
            box.className = 'box';
            if (boxes[r][c] === 1) {
              box.classList.add('p1');
              box.textContent = 'P1';
            } else if (boxes[r][c] === 2) {
              box.classList.add('p2');
              box.textContent = 'P2';
            }
            boardEl.appendChild(box);
          }
        }
      }
    }
  }

  function handleLineClick(type, r, c) {
    if (isGameOver) return;

    if (type === 'h') {
      if (hLines[r][c] !== 0) return;
      hLines[r][c] = turn;
    } else {
      if (vLines[r][c] !== 0) return;
      vLines[r][c] = turn;
    }

    // Check if any box was completed
    let boxesCompleted = checkBoxes();

    renderBoard();
    checkGameOver();

    if (!isGameOver) {
      if (!boxesCompleted) {
        turn = turn === 1 ? 2 : 1;
      } else {
        msgEl.textContent = `Player ${turn} completed a box! Extra turn.`;
      }
      turnEl.textContent = `Turn: P${turn} (${turn === 1 ? 'Teal' : 'Purple'})`;
      scoreEl.textContent = `P1: ${scores[1]} | P2: ${scores[2]}`;
    }
  }

  function checkBoxes() {
    let completedAny = false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (boxes[r][c] === 0) {
          // A box is bounded by: hLines[r][c], hLines[r+1][c], vLines[r][c], vLines[r][c+1]
          if (hLines[r][c] && hLines[r+1][c] && vLines[r][c] && vLines[r][c+1]) {
            boxes[r][c] = turn;
            scores[turn]++;
            completedAny = true;
          }
        }
      }
    }
    return completedAny;
  }

  function checkGameOver() {
    let totalBoxes = size * size;
    if (scores[1] + scores[2] === totalBoxes) {
      isGameOver = true;
      if (scores[1] > scores[2]) msgEl.textContent = `GAME OVER. Player 1 Wins!`;
      else if (scores[2] > scores[1]) msgEl.textContent = `GAME OVER. Player 2 Wins!`;
      else msgEl.textContent = `GAME OVER. It's a Tie!`;
      msgEl.style.color = "var(--accent)";
      turnEl.textContent = "Match Complete";
      scoreEl.textContent = `Final — P1: ${scores[1]} | P2: ${scores[2]}`;
    }
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});