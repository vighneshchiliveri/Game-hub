document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const movesElement = document.getElementById('moves-box');
  const timerElement = document.getElementById('timer-box');
  const resetBtn = document.getElementById('reset-btn');
  const messageElement = document.getElementById('game-message');

  const EMOJIS = ['🚀', '👾', '🕹️', '💎', '🔥', '🌟', '🎲', '🧩'];
  
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let timer = 0;
  let timerInterval = null;
  let isLocked = false;
  let gameStarted = false;

  function initGame() {
    boardElement.innerHTML = '';
    messageElement.textContent = '';
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    isLocked = false;
    gameStarted = false;
    
    clearInterval(timerInterval);
    updateUI();

    // Duplicate emojis for pairs and shuffle them
    cards = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);

    cards.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.classList.add('memory-card');
      card.dataset.emoji = emoji;
      
      const front = document.createElement('div');
      front.classList.add('front');

      const back = document.createElement('div');
      back.classList.add('back');
      back.textContent = emoji;

      card.appendChild(front);
      card.appendChild(back);
      
      card.addEventListener('click', () => flipCard(card));
      boardElement.appendChild(card);
    });
  }

  function startTimer() {
    if (!gameStarted) {
      gameStarted = true;
      timerInterval = setInterval(() => {
        timer++;
        timerElement.textContent = `Time: ${timer}s`;
      }, 1000);
    }
  }

  function flipCard(card) {
    if (isLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    startTimer();
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      movesElement.textContent = `Moves: ${moves}`;
      checkForMatch();
    }
  }

  function checkForMatch() {
    let isMatch = flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji;
    isMatch ? handleMatch() : unflipCards();
  }

  function handleMatch() {
    flippedCards[0].classList.add('matched');
    flippedCards[1].classList.add('matched');
    matchedPairs++;
    flippedCards = [];

    if (matchedPairs === EMOJIS.length) {
      clearInterval(timerInterval);
      messageElement.innerHTML = `<span style="color: var(--teal); font-weight: 600;">Memory mastered! Cleared in ${moves} moves and ${timer} seconds.</span>`;
    }
  }

  function unflipCards() {
    isLocked = true;
    setTimeout(() => {
      flippedCards[0].classList.remove('flipped');
      flippedCards[1].classList.remove('flipped');
      flippedCards = [];
      isLocked = false;
    }, 1000); // 1 second delay so player can see the mismatch
  }

  function updateUI() {
    movesElement.textContent = `Moves: 0`;
    timerElement.textContent = `Time: 0s`;
  }

  resetBtn.addEventListener('click', initGame);
  
  // Start game on load
  initGame();
});