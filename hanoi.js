document.addEventListener('DOMContentLoaded', () => {
  const pegContainers = document.querySelectorAll('.peg-container');
  const movesEl = document.getElementById('moves-box');
  const msgEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  let pegs = [[4, 3, 2, 1], [], []]; // 4 disks on peg 0
  let selectedPeg = null;
  let moves = 0;
  let isWon = false;

  const diskWidths = ['', '60px', '85px', '110px', '135px'];

  function initGame() {
    pegs = [[4, 3, 2, 1], [], []];
    selectedPeg = null;
    moves = 0;
    isWon = false;
    movesEl.textContent = `Moves: 0`;
    msgEl.textContent = '';
    render();
  }

  function render() {
    pegContainers.forEach((container, index) => {
      const stack = container.querySelector('.disk-stack');
      stack.innerHTML = '';
      
      if (index === selectedPeg) {
        container.classList.add('selected');
      } else {
        container.classList.remove('selected');
      }

      pegs[index].forEach(diskSize => {
        const disk = document.createElement('div');
        disk.className = 'hanoi-disk';
        disk.style.width = diskWidths[diskSize];
        stack.appendChild(disk);
      });
    });
  }

  function handlePegClick(pegIndex) {
    if (isWon) return;

    if (selectedPeg === null) {
      if (pegs[pegIndex].length === 0) return; // Can't pick from empty peg
      selectedPeg = pegIndex;
    } else {
      if (selectedPeg === pegIndex) {
        selectedPeg = null; // Deselect if clicking same peg
      } else {
        // Try to move disk
        const sourceDisk = pegs[selectedPeg][pegs[selectedPeg].length - 1];
        const targetTopDisk = pegs[pegIndex][pegs[pegIndex].length - 1];

        if (!targetTopDisk || sourceDisk < targetTopDisk) {
          pegs[pegIndex].push(pegs[selectedPeg].pop());
          moves++;
          movesEl.textContent = `Moves: ${moves}`;
          selectedPeg = null;
          checkWin();
        } else {
          msgEl.textContent = "INVALID MOVE: Larger disk cannot sit on smaller disk.";
          msgEl.style.color = "#ef4444";
          setTimeout(() => { if(!isWon) msgEl.textContent = ''; }, 2000);
          selectedPeg = null;
        }
      }
    }
    render();
  }

  function checkWin() {
    if (pegs[2].length === 4) {
      isWon = true;
      msgEl.textContent = `TOWER ASSEMBLED IN ${moves} MOVES!`;
      msgEl.style.color = "var(--accent)";
    }
  }

  pegContainers.forEach((container, index) => {
    container.addEventListener('click', () => handlePegClick(index));
  });

  resetBtn.addEventListener('click', initGame);
  initGame();
});