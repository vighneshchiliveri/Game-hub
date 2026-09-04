document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('picross-board');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  // 1 = filled, 0 = empty
  // Pattern: A retro space invader face
  const solution = [
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0]
  ];

  const rowClues = [
    [3],
    [1, 1, 1],
    [5],
    [1, 1],
    [1, 1]
  ];

  const colClues = [
    [3],
    [1, 2],
    [3],
    [1, 2],
    [3]
  ];

  let gridState = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ]; // 0 = empty, 1 = filled, 2 = marked (X)

  // Prevent context menu on right click
  board.addEventListener('contextmenu', e => e.preventDefault());

  function initBoard() {
    board.innerHTML = '';
    msgEl.textContent = '';
    gridState = gridState.map(row => row.map(() => 0));

    // Top-left empty corner
    const corner = document.createElement('div');
    corner.className = 'empty-corner';
    board.appendChild(corner);

    // Column Clues
    for (let c = 0; c < 5; c++) {
      const colClueCell = document.createElement('div');
      colClueCell.className = 'clue-cell col-clue';
      colClues[c].forEach(num => {
        const span = document.createElement('span');
        span.textContent = num;
        colClueCell.appendChild(span);
      });
      board.appendChild(colClueCell);
    }

    // Rows
    for (let r = 0; r < 5; r++) {
      // Row clue
      const rowClueCell = document.createElement('div');
      rowClueCell.className = 'clue-cell row-clue';
      rowClues[r].forEach(num => {
        const span = document.createElement('span');
        span.textContent = num;
        rowClueCell.appendChild(span);
      });
      board.appendChild(rowClueCell);

      // Grid cells
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Left Click
        cell.addEventListener('click', () => toggleCell(r, c, cell, 'fill'));
        // Right Click
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          toggleCell(r, c, cell, 'mark');
        });

        board.appendChild(cell);
      }
    }
  }

  function toggleCell(r, c, cellDOM, action) {
    if (msgEl.textContent.includes("CLEAR")) return; // Game over freeze

    if (action === 'fill') {
      if (gridState[r][c] === 1) {
        gridState[r][c] = 0; // Unfill
        cellDOM.classList.remove('filled');
      } else {
        gridState[r][c] = 1; // Fill
        cellDOM.classList.remove('marked');
        cellDOM.textContent = '';
        cellDOM.classList.add('filled');
      }
    } else if (action === 'mark') {
      if (gridState[r][c] === 2) {
        gridState[r][c] = 0; // Unmark
        cellDOM.classList.remove('marked');
        cellDOM.textContent = '';
      } else {
        gridState[r][c] = 2; // Mark X
        cellDOM.classList.remove('filled');
        cellDOM.classList.add('marked');
        cellDOM.textContent = '✕';
      }
    }

    checkWin();
  }

  function checkWin() {
    let won = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        // To win, filled cells must match solution exactly. 
        // We ignore 'marked' cells as long as they are 0 in solution.
        let isFilled = (gridState[r][c] === 1);
        let shouldBeFilled = (solution[r][c] === 1);
        if (isFilled !== shouldBeFilled) {
          won = false;
          break;
        }
      }
    }

    if (won) {
      msgEl.textContent = "SYSTEM CLEAR: ALIEN DETECTED.";
      msgEl.style.color = "var(--accent)";
      
      // Auto-remove marks to show clean image
      const cells = document.querySelectorAll('.grid-cell');
      cells.forEach(cell => {
        if (cell.classList.contains('marked')) {
          cell.classList.remove('marked');
          cell.textContent = '';
        }
      });
    }
  }

  resetBtn.addEventListener('click', initBoard);
  initBoard();
});