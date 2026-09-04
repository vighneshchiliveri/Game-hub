document.addEventListener('DOMContentLoaded', () => {
  const playerBoardEl = document.getElementById('player-board');
  const cpuBoardEl = document.getElementById('cpu-board');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  const SIZE = 10;
  const SHIPS = [5, 4, 3, 3, 2];
  
  let playerGrid = [];
  let cpuGrid = [];
  let isGameOver = false;
  let playerHits = 0;
  let cpuHits = 0;
  const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);

  function createEmptyGrid() {
    return Array(SIZE).fill(null).map(() => Array(SIZE).fill({ hasShip: false, isHit: false }));
  }

  function placeShipsRandomly(grid) {
    let newGrid = JSON.parse(JSON.stringify(grid));
    SHIPS.forEach(shipLength => {
      let placed = false;
      while (!placed) {
        const isHorizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);

        if (canPlaceShip(newGrid, row, col, shipLength, isHorizontal)) {
          for (let i = 0; i < shipLength; i++) {
            if (isHorizontal) newGrid[row][col + i].hasShip = true;
            else newGrid[row + i][col].hasShip = true;
          }
          placed = true;
        }
      }
    });
    return newGrid;
  }

  function canPlaceShip(grid, row, col, length, isHorizontal) {
    if (isHorizontal && col + length > SIZE) return false;
    if (!isHorizontal && row + length > SIZE) return false;

    for (let i = 0; i < length; i++) {
      if (isHorizontal && grid[row][col + i].hasShip) return false;
      if (!isHorizontal && grid[row + i][col].hasShip) return false;
    }
    return true;
  }

  function renderBoards() {
    playerBoardEl.innerHTML = '';
    cpuBoardEl.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        // Player Cell
        const pCell = document.createElement('div');
        pCell.classList.add('battle-cell');
        if (playerGrid[r][c].hasShip) pCell.classList.add('ship');
        if (playerGrid[r][c].isHit) {
          pCell.classList.add(playerGrid[r][c].hasShip ? 'hit' : 'miss');
        }
        playerBoardEl.appendChild(pCell);

        // CPU Cell
        const cCell = document.createElement('div');
        cCell.classList.add('battle-cell');
        if (cpuGrid[r][c].isHit) {
          cCell.classList.add(cpuGrid[r][c].hasShip ? 'hit' : 'miss');
        }
        
        cCell.addEventListener('click', () => handlePlayerTurn(r, c));
        cpuBoardEl.appendChild(cCell);
      }
    }
  }

  function handlePlayerTurn(r, c) {
    if (isGameOver || cpuGrid[r][c].isHit) return;

    cpuGrid[r][c].isHit = true;
    if (cpuGrid[r][c].hasShip) {
      playerHits++;
      msgEl.textContent = "Direct Hit!";
    } else {
      msgEl.textContent = "Miss! Enemy returning fire...";
    }

    renderBoards();
    checkWin();

    if (!isGameOver) {
      setTimeout(cpuTurn, 600);
    }
  }

  function cpuTurn() {
    let r, c;
    do {
      r = Math.floor(Math.random() * SIZE);
      c = Math.floor(Math.random() * SIZE);
    } while (playerGrid[r][c].isHit);

    playerGrid[r][c].isHit = true;
    if (playerGrid[r][c].hasShip) {
      cpuHits++;
      msgEl.textContent = "Warning! Our ship was hit!";
    } else {
      msgEl.textContent = "Enemy missed. Your turn!";
    }

    renderBoards();
    checkWin();
  }

  function checkWin() {
    if (playerHits === totalShipCells) {
      msgEl.textContent = "VICTORY! Enemy fleet destroyed.";
      msgEl.style.color = "var(--teal)";
      isGameOver = true;
    } else if (cpuHits === totalShipCells) {
      msgEl.textContent = "DEFEAT! Our fleet was sunk.";
      msgEl.style.color = "#ef4444";
      isGameOver = true;
    }
  }

  function initGame() {
    isGameOver = false;
    playerHits = 0;
    cpuHits = 0;
    msgEl.textContent = "Commander, fire at the Enemy Radar!";
    msgEl.style.color = "var(--teal)";
    
    playerGrid = placeShipsRandomly(createEmptyGrid());
    cpuGrid = placeShipsRandomly(createEmptyGrid());
    
    renderBoards();
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
});