document.addEventListener('DOMContentLoaded', () => {
  const trackEl = document.getElementById('track');
  const turnEl = document.getElementById('turn-box');
  const dieEl = document.getElementById('die-box');
  const rollBtn = document.getElementById('roll-btn');
  const msgEl = document.getElementById('game-message');

  // Mini loop track of 16 cells (indices 0 to 15)
  // Teal starts at 0, Purple starts at 8
  let players = {
    teal: { id: 'teal', color: 'teal', startPos: 0, tokens: [-1, -1] }, // -1 means in base
    purple: { id: 'purple', color: 'purple', startPos: 8, tokens: [-1, -1] }
  };

  let turn = 'teal';
  let currentRoll = null;
  let hasRolled = false;
  let isGameOver = false;

  function initBoard() {
    trackEl.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      trackEl.appendChild(cell);
    }
    renderTokens();
  }

  function renderTokens() {
    // Clear tokens from cells
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = '');

    // Place tokens
    ['teal', 'purple'].forEach(pKey => {
      players[pKey].tokens.forEach((pos, tIdx) => {
        if (pos >= 0 && pos < 16) {
          const cell = trackEl.children[pos];
          const token = document.createElement('div');
          token.className = `token ${players[pKey].color}`;
          token.addEventListener('click', () => handleTokenClick(pKey, tIdx));
          cell.appendChild(token);
        }
      });
    });
  }

  function rollDie() {
    if (hasRolled || isGameOver) return;
    currentRoll = Math.floor(Math.random() * 6) + 1;
    dieEl.textContent = `Die: ${currentRoll}`;
    hasRolled = true;
    rollBtn.classList.remove('active');

    // Check if player has any valid moves
    let p = players[turn];
    let canMove = p.tokens.some(pos => {
      if (pos === -1 && currentRoll === 6) return true; // Can enter board
      if (pos >= 0 && pos + currentRoll < 16) return true; // Can move forward
      return false;
    });

    if (!canMove) {
      msgEl.textContent = `${turn.toUpperCase()} has no valid moves. Turn skipped.`;
      setTimeout(() => {
        msgEl.textContent = '';
        switchTurn();
      }, 1500);
    }
  }

  function handleTokenClick(pKey, tIdx) {
    if (!hasRolled || pKey !== turn || isGameOver) return;

    let pos = players[pKey].tokens[tIdx];
    let p = players[pKey];

    if (pos === -1) {
      if (currentRoll === 6) {
        // Enter board at start position
        // Check if own token occupies it
        if (!p.tokens.includes(p.startPos)) {
          // Check opponent capture
          checkCapture(p.startPos, pKey);
          p.tokens[tIdx] = p.startPos;
          endTurn();
        } else {
          msgEl.textContent = "Cell blocked by your own token.";
        }
      } else {
        msgEl.textContent = "Need a 6 to enter the track!";
      }
    } else {
      let newPos = pos + currentRoll;
      if (newPos < 16) {
        // Check own token block
        if (!p.tokens.includes(newPos)) {
          checkCapture(newPos, pKey);
          p.tokens[tIdx] = newPos;
          endTurn();
        } else {
          msgEl.textContent = "Cell blocked by your own token.";
        }
      } else {
        msgEl.textContent = "Exact count needed to reach home.";
      }
    }
    renderTokens();
    checkWin();
  }

  function checkCapture(targetPos, activePlayerKey) {
    let opponentKey = activePlayerKey === 'teal' ? 'purple' : 'teal';
    let opp = players[opponentKey];
    opp.tokens.forEach((pos, idx) => {
      if (pos === targetPos) {
        opp.tokens[idx] = -1; // Send back to base
        msgEl.textContent = `${activePlayerKey.toUpperCase()} captured ${opponentKey.toUpperCase()} token!`;
      }
    });
  }

  function endTurn() {
    hasRolled = false;
    currentRoll = null;
    dieEl.textContent = `Die: -`;
    rollBtn.classList.add('active');
    switchTurn();
  }

  function switchTurn() {
    turn = turn === 'teal' ? 'purple' : 'teal';
    turnEl.textContent = `Turn: ${turn.toUpperCase()}`;
    turnEl.style.color = turn === 'teal' ? 'var(--teal)' : 'var(--accent)';
  }

  function checkWin() {
    ['teal', 'purple'].forEach(pKey => {
      // If all tokens reached cell 15 (home)
      if (players[pKey].tokens.every(pos => pos === 15)) {
        isGameOver = true;
        msgEl.textContent = `VICTORY! ${pKey.toUpperCase()} WINS!`;
        msgEl.style.color = "var(--accent)";
        turnEl.textContent = "Match Complete";
      }
    });
  }

  rollBtn.addEventListener('click', rollDie);
  initBoard();
});