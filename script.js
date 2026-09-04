// Game-Hub — filtering and search
// Separate JS file, kept dependency-free.

document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchBar = document.getElementById('search-bar');
  const cards = Array.from(document.querySelectorAll('.game-card'));
  const noResults = document.getElementById('no-results');

  let activeFilter = 'all';

  function applyFilters() {
    const query = searchBar.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const title = (card.dataset.title || '').toLowerCase();
      const matchesQuery = query === '' || title.includes(query);
      const show = matchesCategory && matchesQuery;

      card.classList.toggle('is-hidden', !show);
      if (show) visibleCount += 1;
    });

    noResults.hidden = visibleCount !== 0;
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  searchBar.addEventListener('input', applyFilters);

  // Soft press feedback for cards that don't yet have a destination
  cards.forEach((card) => {
    if (card.classList.contains('is-soon')) {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        card.animate(
          [
            { transform: 'translateY(-6px) scale(1)' },
            { transform: 'translateY(-2px) scale(0.97)' },
            { transform: 'translateY(-6px) scale(1)' },
          ],
          { duration: 280, easing: 'ease-out' }
        );
      });
    }
  });
});
