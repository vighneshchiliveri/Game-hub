// Logic for filtering and searching the collection
const searchBar = document.getElementById('search-bar');
const cards = document.querySelectorAll('.game-card');
const filterBtns = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('no-results');

let currentCategory = 'all';

// Filter by Category Buttons
function filterGames(category) {
    currentCategory = category;
    
    // Update active button styling
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    applyFilters();
}

// Filter by Search Bar
searchBar.addEventListener('input', applyFilters);

function applyFilters() {
    const searchTerm = searchBar.value.toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.querySelector('.game-title').textContent.toLowerCase();
        const category = card.dataset.category;
        
        const matchesSearch = title.includes(searchTerm);
        const matchesCategory = currentCategory === 'all' || category === currentCategory;

        if (matchesSearch && matchesCategory) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide the "no results" message
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}
