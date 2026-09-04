document.addEventListener('DOMContentLoaded', () => {
  const turnEl = document.getElementById('turn-box');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');
  const store1El = document.getElementById('count-store1');
  const store2El = document.getElementById('count-store2');
  const pitNodes = document.querySelectorAll('.pit');

  // Board Layout:
  // 0-5: Player 1 pits (bottom row, left to right)
  // 6: Player 1 store
  // 7-12: Player 2 pits (top row, right to left in DOM order)
  // 13: Player 2 store
  let board = [];
  let turn = 1; // 1 or 2
  let isGameOver = false;

  function initGame() {
    board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
    turn = 1;
    isGameOver = false;
    msgEl.textContent = '';
    turnEl.textContent = `Turn: Player 1`;
    render();
  }

  function render() {
    // Update Pits
    pitNodes.forEach(pit => {
      const idx = parseInt(pit.dataset.index);
      pit.querySelector('.seed-count').textContent = board[idx];
    });

    // Update Stores
    store1El.textContent = board[6];
    store2El.textContent = board[13];
  }

  function handlePitClick(idx) {
    if (isGameOver) return;

    // Validate turn ownership
    if (turn === 1 && (idx < 0 || idx > 5)) {
      msgEl.textContent = "Select your own pits (bottom row).";
      return;
    }
    if (turn === 2 && (idx < 7 || idx > 12)) {
      msgEl.textContent = "Select your own pits (top row).";
      return;
    }

    let seeds = board[idx];
    if (seeds === 0) {
      msgEl.textContent = "That pit is empty!";
      return;
    }

    msgEl.textContent = "";
    board[idx] = 0;
    let currentIdx = idx;

    while (seeds > 0) {
      currentIdx = (currentIdx + 1) % 14;

      // Skip opponent's store
      if (turn === 1 && currentIdx === 13) continue;
      if (turn === 2 && currentIdx === 6) continue;

      board[currentIdx]++;
      seeds--;
    }

    // Check Extra Turn rule (landing in your own store)
    let landedInStore = (turn === 1 && currentIdx === 6) || (turn === 2 && currentIdx === 13);

    // Check Capture Rule (landing in an empty pit on your side)
    let isOwnSide = (turn === 1 && currentIdx >= 0 && currentIdx <= 5) || (turn === 2 && currentIdx >= 7 && currentIdx <= 12);
    if (!landedInStore && isOwnSide && board[currentIdx] === 1) {
      let oppositeIdx = 12 - currentIdx;
      if (board[oppositeIdx] > 0) {
        let storeIdx = (turn === 1) ? 6 : 13;
        board[storeIdx] += board[oppositeIdx] + 1;
        board[oppositeIdx] = 0;
        board[currentIdx] = 0;
      }
    }

    render();
    checkGameOver();

    if (!isGameOver) {
      if (!landedInStore) {
        turn = turn === 1 ? 2 : 1;
      } else {
        msgEl.textContent = `Player ${turn} landed in store! Extra turn.`;
      }
      turnEl.textContent = `Turn: Player ${turn}`;
    }
  }

  function checkGameOver() {
    let p1Empty = board.slice(0, 6).every(val => val === 0);
    let p2Empty = board.slice(7, 13).every(val => val === 0);

    if (p1Empty || p2Empty) {
      isGameOver = true;
      // Sweep remaining seeds into respective stores
      for (let i = 0; i < 6; i++) { board[6] += board[i]; board[i] = 0; }
      for (let i = 7; i < 13; i++) { board[13] += board[i]; board[i] = 0; }
      render();

      let p1Score = board[6];
      let p2Score = board[13];
      if (p1Score > p2Score) msgEl.textContent = `GAME OVER. Player 1 Wins! (${p1Score} to ${p2Score})`;
      else if (p2Score > p1Score) msgEl.textContent = `GAME OVER. Player 2 Wins! (${p2Score} to ${p1Score})`;
      else msgEl.textContent = `GAME OVER. It's a Tie!`;
      msgEl.style.color = "var(--accent)";
      turnEl.textContent = "Match Complete";
    }
  }

  pitNodes.forEach(pit => {
    pit.addEventListener('click', () => {
      handlePitClick(parseInt(pit.dataset.index));
    });
  });

  resetBtn.addEventListener('click', initGame);
  initGame();
});