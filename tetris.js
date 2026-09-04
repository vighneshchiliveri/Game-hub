document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const scoreElement = document.getElementById('score-box');
  const levelElement = document.getElementById('level-box');
  const resetBtn = document.getElementById('reset-btn');
  const messageElement = document.getElementById('game-message');

  const COLS = 10;
  const ROWS = 20;
  let board = [];
  let cells = [];
  let score = 0;
  let level = 1;
  let linesCleared = 0;
  let gameInterval;
  let isGameOver = true;
  let dropSpeed = 800; // ms

  // Tetromino matrices (0 = empty, >0 = type/color)
  const SHAPES = [
    [], // 0 placeholder
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // 1: I
    [[2,0,0],[2,2,2],[0,0,0]],                 // 2: J
    [[0,0,3],[3,3,3],[0,0,0]],                 // 3: L
    [[4,4],[4,4]],                             // 4: O
    [[0,5,5],[5,5,0],[0,0,0]],                 // 5: S
    [[0,6,0],[6,6,6],[0,0,0]],                 // 6: T
    [[7,7,0],[0,7,7],[0,0,0]]                  // 7: Z
  ];

  let piece = { matrix: [], x: 0, y: 0 };

  function createBoard() {
    boardElement.innerHTML = '';
    cells = [];
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.classList.add('t-cell');
        boardElement.appendChild(cell);
        cells.push(cell);
      }
    }
  }

  function drawBoard() {
    cells.forEach(cell => cell.className = 't-cell');

    // Draw settled blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] > 0) {
          cells[r * COLS + c].classList.add(`type-${board[r][c]}`);
        }
      }
    }

    // Draw active piece
    if (!isGameOver) {
      piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            const drawY = piece.y + y;
            const drawX = piece.x + x;
            if (drawY >= 0 && drawY < ROWS && drawX >= 0 && drawX < COLS) {
              cells[drawY * COLS + drawX].classList.add(`type-${value}`);
            }
          }
        });
      });
    }
  }

  function spawnPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    piece.matrix = SHAPES[type];
    piece.y = 0;
    piece.x = Math.floor(COLS / 2) - Math.floor(piece.matrix[0].length / 2);

    if (checkCollision()) {
      isGameOver = true;
      clearInterval(gameInterval);
      messageElement.textContent = "Game Over!";
      resetBtn.textContent = "Play Again";
    }
  }

  function checkCollision() {
    for (let y = 0; y < piece.matrix.length; y++) {
      for (let x = 0; x < piece.matrix[y].length; x++) {
        if (piece.matrix[y][x] > 0) {
          let newY = piece.y + y;
          let newX = piece.x + x;
          // Out of bounds or hit settled block
          if (newY >= ROWS || newX < 0 || newX >= COLS || (newY >= 0 && board[newY][newX] > 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function mergePiece() {
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          if (piece.y + y >= 0) {
            board[piece.y + y][piece.x + x] = value;
          }
        }
      });
    });
  }

  function clearLines() {
    let linesToClear = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(value => value > 0)) {
        linesToClear.push(r);
      }
    }

    if (linesToClear.length > 0) {
      linesToClear.forEach(r => {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
      });

      const points = [0, 40, 100, 300, 1200];
      score += points[linesToClear.length] * level;
      linesCleared += linesToClear.length;
      level = Math.floor(linesCleared / 10) + 1;
      
      scoreElement.textContent = `Score: ${score}`;
      levelElement.textContent = `Level: ${level}`;

      // Increase speed
      clearInterval(gameInterval);
      dropSpeed = Math.max(100, 800 - (level - 1) * 70);
      gameInterval = setInterval(update, dropSpeed);
    }
  }

  function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; ++y) {
      for (let x = 0; x < N; ++x) {
        result[x][N - 1 - y] = matrix[y][x];
      }
    }
    return result;
  }

  function playerDrop() {
    piece.y++;
    if (checkCollision()) {
      piece.y--;
      mergePiece();
      clearLines();
      spawnPiece();
    }
    drawBoard();
  }

  function playerMove(offset) {
    piece.x += offset;
    if (checkCollision()) {
      piece.x -= offset;
    }
    drawBoard();
  }

  function playerRotate() {
    const originalMatrix = piece.matrix;
    piece.matrix = rotateMatrix(piece.matrix);
    
    // Kick wall logic (simple)
    let offset = 1;
    let originalX = piece.x;
    while (checkCollision()) {
      piece.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (Math.abs(offset) > piece.matrix[0].length) {
        piece.matrix = originalMatrix;
        piece.x = originalX;
        return;
      }
    }
    drawBoard();
  }

  function update() {
    if (!isGameOver) playerDrop();
  }

  function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    level = 1;
    linesCleared = 0;
    isGameOver = false;
    dropSpeed = 800;
    
    scoreElement.textContent = `Score: 0`;
    levelElement.textContent = `Level: 1`;
    messageElement.textContent = '';
    resetBtn.textContent = "Restart Game";

    spawnPiece();
    drawBoard();

    clearInterval(gameInterval);
    gameInterval = setInterval(update, dropSpeed);
  }

  document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    if (e.key === 'ArrowLeft') {
      playerMove(-1);
    } else if (e.key === 'ArrowRight') {
      playerMove(1);
    } else if (e.key === 'ArrowDown') {
      playerDrop();
    } else if (e.key === 'ArrowUp') {
      playerRotate();
    }
  });

  resetBtn.addEventListener('click', () => {
    if (isGameOver || confirm("Are you sure you want to restart?")) {
      startGame();
    }
  });

  createBoard();
});