document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('sudoku-board');
  const resetBtn = document.getElementById('reset-btn');
  const checkBtn = document.getElementById('check-btn');
  const msgEl = document.getElementById('game-message');

  // Hardcoded puzzle for simplicity (0 is empty)
  const solvedBoard = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];

  let currentBoard = [];

  function generatePuzzle() {
    currentBoard = solvedBoard.map(row => [...row]);
    // Remove ~40 random cells
    for(let i=0; i<40; i++) {
      let r = Math.floor(Math.random() * 9);
      let c = Math.floor(Math.random() * 9);
      currentBoard[r][c] = 0;
    }
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.classList.add('sudoku-cell');
        input.dataset.row = r;
        input.dataset.col = c;

        if (currentBoard[r][c] !== 0) {
          input.value = currentBoard[r][c];
          input.classList.add('prefilled');
          input.readOnly = true;
        }

        input.addEventListener('input', (e) => {
          input.classList.remove('error');
          msgEl.textContent = "";
          if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
        });
        
        boardEl.appendChild(input);
      }
    }
  }

  function checkBoard() {
    let inputs = document.querySelectorAll('.sudoku-cell');
    let isComplete = true;
    let isCorrect = true;

    inputs.forEach(input => {
      let r = input.dataset.row;
      let c = input.dataset.col;
      input.classList.remove('error');

      if (input.value === '') {
        isComplete = false;
      } else if (parseInt(input.value) !== solvedBoard[r][c]) {
        input.classList.add('error');
        isCorrect = false;
      }
    });

    if (!isComplete) msgEl.textContent = "Keep going! There are empty cells.";
    else if (!isCorrect) { msgEl.textContent = "Some numbers are incorrect."; msgEl.style.color = "#ef4444"; }
    else { msgEl.textContent = "PUZZLE SOLVED!"; msgEl.style.color = "var(--teal)"; }
  }

  resetBtn.addEventListener('click', () => { msgEl.textContent = ""; generatePuzzle(); renderBoard(); });
  checkBtn.addEventListener('click', checkBoard);
  
  generatePuzzle(); renderBoard();
});