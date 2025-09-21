// ========== Javascript code ==========


// Keys are saved as constants
const API_KEY_MOVIES = '18ec3f29';   // OMDb
const API_KEY_GAMES = '81ce7b71192244138548d1515f644421';  // RAWG

// Check current page tyoe using <titles>
const isMoviePage = document.title.includes('Movie');
const isGamePage = document.title.includes('Game');
const isFavoritesPage = document.title.includes('Favorites');

// Global variables hold references to HTML elements
let toggle, sidebarDarkToggle, toggleSidebarBtn, sidebar;
let typeFilter, movieFilters, movieGenreFilter, movieSortBy, gameFilters, gameGenreFilter, gameSortBy;
let favoritesList;
let searchBtn, searchInput, movieList, modal, modalDetails, closeBtn;

  

    // Search on enter key
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (!query) return;

        if (isMoviePage) {
          searchMovies(query);
        } else if (isGamePage) {
          searchGames(query);
        }
      }
    });
  }

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      modal.style.display = 'none';
    }
  });

  // Close button (×) closes modal
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Click outside modal content closes modal
  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) { // ensure didn't click inside modal
        modal.style.display = 'none';
      }
    });
  }


// Core initializer
document.addEventListener('DOMContentLoaded', () => {

  toggle = document.getElementById('darkModeToggle');
  sidebarDarkToggle = document.getElementById('sidebarDarkToggle');
  toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  sidebar = document.getElementById('sidebar');

  typeFilter = document.getElementById('typeFilter');
  movieFilters = document.getElementById('movieFilters');
  movieGenreFilter = document.getElementById('movieGenreFilter');
  movieSortBy = document.getElementById('movieSortBy');
  gameFilters = document.getElementById('gameFilters');
  gameGenreFilter = document.getElementById('gameGenreFilter');
  gameSortBy = document.getElementById('gameSortBy');

  favoritesList = document.getElementById('favoritesList');

  searchBtn = document.getElementById('searchBtn');
  searchInput = document.getElementById('searchInput');
  movieList = document.getElementById('movieList');
  modal = document.getElementById('movieModal');
  modalDetails = document.getElementById('modalDetails');
  closeBtn = document.querySelector('.close-btn');

  // Close modal pop up on page load
  if (modal) modal.style.display = 'none';
  if (modalDetails) modalDetails.innerHTML = '';

  // Sets up modal closing logic
  if (closeBtn) { // Close on x
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) { // Close on click outside the modal box
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  document.addEventListener('keydown', (e) => { // Close on escape key
    if (e.key === 'Escape' && modal) {
      modal.style.display = 'none';
    }
  });

  // Initialize all app features
  applyDarkModeSetting();
  setupDarkModeToggles();
  setupSidebarToggle();

  if (isMoviePage || isGamePage) { // Enables search logic
    setupSearch();
  }
  if (isFavoritesPage) {
    renderFavorites();
    updateVisibleFilters();
    setupFavoritesFilterListeners();
  }
});



// Dark mode
function applyDarkModeSetting() {
  const darkMode = localStorage.getItem('darkMode'); // Get value from storage
  const isEnabled = darkMode === 'enabled'; // Check if dark mode is applied
  if (isEnabled) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // Syncs checkboxes in UI
  if (toggle) toggle.checked = isEnabled;
  if (sidebarDarkToggle) sidebarDarkToggle.checked = isEnabled;
}


// Adds functionality for dark mode buttons
function setupDarkModeToggles() {
  if (toggle) {
    toggle.addEventListener('change', () => {
      const checked = toggle.checked;
      document.body.classList.toggle('dark', checked);
      localStorage.setItem('darkMode', checked ? 'enabled' : 'disabled');
      if (sidebarDarkToggle) sidebarDarkToggle.checked = checked;
    });
  }
  if (sidebarDarkToggle) {
    sidebarDarkToggle.addEventListener('change', () => {
      const checked = sidebarDarkToggle.checked;
      document.body.classList.toggle('dark', checked);
      localStorage.setItem('darkMode', checked ? 'enabled' : 'disabled');
      if (toggle) toggle.checked = checked;
    });
  }
}

// Sidebar toggle
function setupSidebarToggle() {
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active'); // Allows sidebar to be shown or hidden
      if (isFavoritesPage) renderFavorites(); // Refresh favourites list
    });
  }
}

// Search functionality
function setupSearch() {
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (!query) return;

      // Checks which page user is on
      if (isMoviePage) {
        searchMovies(query);
      } else if (isGamePage) {
        searchGames(query);
      }
    });

    // Enter key to search
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (!query) return;

        if (isMoviePage) {
          searchMovies(query);
        } else if (isGamePage) {
          searchGames(query);
        }
      }
    });
  }
}

// Sends search request to OMDb API
async function searchMovies(query) {
  if (!movieList) return;
  movieList.innerHTML = 'Loading...';
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY_MOVIES}&s=${encodeURIComponent(query)}&type=movie`); // Fetch call
    const data = await response.json();
    if (data.Response === "True") { // If results found
      displayMovies(data.Search);
    } else {
      movieList.innerHTML = `<p>No results found for "${query}".</p>`; // If results not found
    }
  } catch (error) {
    movieList.innerHTML = `<p>Error fetching data. Please try again.</p>`;
    console.error(error);
  }
}

// Used modular functions
// Renders list of movie cards
function displayMovies(movies) { // Involves click listeners and fallback images
  if (!movieList) return;
  movieList.innerHTML = '';
  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <p>Type: ${movie.Type}</p>
    `;
    movieCard.addEventListener('click', () => showMovieDetails(movie.imdbID));
    movieList.appendChild(movieCard);
  });
}

async function showMovieDetails(imdbID) {
  if (!modal || !modalDetails) return;
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY_MOVIES}&i=${imdbID}&plot=full`);
    const movie = await res.json();
    if (movie.Response === "True") {
      modalDetails.innerHTML = `
        <h2>${movie.Title} (${movie.Year})</h2>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Actors:</strong> ${movie.Actors}</p>
        <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p> 
        <button id="favoriteBtn">⭐ Add to Favorites</button>
      `; 
      // Dynamically creates modal HTML

      modal.style.display = 'block';
      const favBtn = document.getElementById('favoriteBtn');
      if (favBtn) { // Add to favorites button

        favBtn.addEventListener('click', () => addToFavorites(movie, 'movie'));
      }
    } else {
      modalDetails.innerHTML = `<p>Details not found.</p>`;
      modal.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    modalDetails.innerHTML = `<p>Something went wrong.</p>`;
    modal.style.display = 'block';
  }
}

// Search games using RAWG API
async function searchGames(query) {
  if (!movieList) return;
  movieList.innerHTML = 'Loading...';
  try {
    const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY_GAMES}&search=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      displayGames(data.results); //if results found call funtion displayGames(results)
    } else {
      movieList.innerHTML = `<p>No results found for "${query}".</p>`;
    }
  } catch (error) {
    movieList.innerHTML = `<p>Error fetching data. Please try again.</p>`;
    console.error(error);
  }
}


// Create card layout for games
function displayGames(games) {
  if (!movieList) return;
  movieList.innerHTML = '';
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'movie-card';
    gameCard.innerHTML = `
      <img src="${game.background_image || 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${game.name}">
      <h3>${game.name}</h3>
      <p>Released: ${game.released || 'N/A'}</p>
      <p>Rating: ${game.rating || 'N/A'}</p>
    `;
    gameCard.addEventListener('click', () => showGameDetails(game.id));
    movieList.appendChild(gameCard);
  });
}

// Fetch full game info from RAWG
async function showGameDetails(id) {
  if (!modal || !modalDetails) return;
  try {
    const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY_GAMES}`);
    const game = await res.json();
    // Populate modal with RAWG data
    modalDetails.innerHTML = `
      <h2>${game.name}</h2>
      <img src="${game.background_image || 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${game.name}">
      <p><strong>Released:</strong> ${game.released || 'N/A'}</p>
      <p><strong>Rating:</strong> ${game.rating} / ${game.rating_top}</p>
      <p><strong>Genres:</strong> ${game.genres.map(g => g.name).join(', ')}</p>
      <p><strong>Description:</strong> ${game.description_raw || 'No description available.'}</p>
      <button id="favoriteBtn">⭐ Add to Favorites</button>
    `;
    modal.style.display = 'block';
    const favBtn = document.getElementById('favoriteBtn');
    if (favBtn) {
      favBtn.addEventListener('click', () => addToFavorites(game, 'game'));
    }
  } catch (error) {
    console.error('Error fetching game details:', error);
    modalDetails.innerHTML = `<p>Something went wrong.</p>`;
    modal.style.display = 'block';
  }
}


// Adds genre dropdown menu
function populateGenreFilters(favorites) {
  if (!movieGenreFilter || !gameGenreFilter) return;

  const movieGenres = new Set();
  const gameGenres = new Set();

  favorites.forEach(fav => {
    if (fav.type === 'movie') {
      const genreString = fav.raw.Genre || '';
      genreString.split(',').forEach(g => {
        const tg = g.trim();
        if (tg) movieGenres.add(tg);
      });
    } else if (fav.type === 'game') {
      const ga = fav.raw.genres?.map(g => g.name) || [];
      ga.forEach(g => {
        const tg = g.trim();
        if (tg) gameGenres.add(tg);
      });
    }
  });

  // Movies
  movieGenreFilter.innerHTML = '<option value="all">All</option>';
  [...movieGenres].sort().forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    movieGenreFilter.appendChild(opt);
  });

  // Games
  gameGenreFilter.innerHTML = '<option value="all">All</option>';
  [...gameGenres].sort().forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    gameGenreFilter.appendChild(opt);
  });
}

// Shows or hides filters depending on choices selected
function updateVisibleFilters() {
  if (!typeFilter || !movieFilters || !gameFilters) return;
  const selectedType = typeFilter.value;

  if (selectedType === 'movie') {
    movieFilters.style.display = 'block';
    gameFilters.style.display = 'none';
  } else if (selectedType === 'game') {
    movieFilters.style.display = 'none';
    gameFilters.style.display = 'block';
  } else {
    movieFilters.style.display = 'none';
    gameFilters.style.display = 'none';
  }
}

// Loads favorites from localStorage and displays based on filters
function renderFavorites() {
  if (!favoritesList) return;

  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  populateGenreFilters(favorites);

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<li>No favorites yet.</li>';
    return;
  }

  const selectedType = typeFilter?.value || 'all';
  let filtered = [...favorites];

  if (selectedType !== 'all') {
    filtered = filtered.filter(f => f.type === selectedType);
  }

  // Filter by genre for each type
  if (selectedType === 'movie' && movieGenreFilter) {
    const selGenre = movieGenreFilter.value || 'all';
    if (selGenre !== 'all') {
      filtered = filtered.filter(fav => {
        const genres = fav.raw.Genre || '';
        return genres.toLowerCase().includes(selGenre.toLowerCase());
      });
    }
  } else if (selectedType === 'game' && gameGenreFilter) {
    const selGenre = gameGenreFilter.value || 'all';
    if (selGenre !== 'all') {
      filtered = filtered.filter(fav => {
        const genres = (fav.raw.genres?.map(g => g.name).join(', ')) || '';
        return genres.toLowerCase().includes(selGenre.toLowerCase());
      });
    }
  }

  // Sorting
  let sortKey = 'title';
  if (selectedType === 'movie' && movieSortBy) {
    sortKey = movieSortBy.value || 'title';
  } else if (selectedType === 'game' && gameSortBy) {
    sortKey = gameSortBy.value || 'title';
  }

  filtered.sort((a, b) => {
    if (sortKey === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortKey === 'rating') {
      const ra = parseFloat(a.raw.imdbRating || a.raw.rating || 0);
      const rb = parseFloat(b.raw.imdbRating || b.raw.rating || 0);
      return rb - ra;
    } else if (sortKey === 'length') {
      const la = parseFloat((a.raw.Runtime && a.raw.Runtime.split(' ')[0]) || a.raw.playtime || 0);
      const lb = parseFloat((b.raw.Runtime && b.raw.Runtime.split(' ')[0]) || b.raw.playtime || 0);
      return lb - la;
    }
    return 0;
  });

  favoritesList.innerHTML = '';

  filtered.forEach(fav => {
    const genres = fav.raw.Genre || (fav.raw.genres?.map(g => g.name).join(', ')) || 'N/A';
    const rating = fav.raw.imdbRating || fav.raw.rating || 'N/A';
    const length = fav.raw.Runtime || fav.raw.playtime || 'N/A';

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="favorite-card">
        <img src="${fav.poster || 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${fav.title}">
        <h3>${fav.title}</h3>
        <p><strong>Type:</strong> ${fav.type}</p>
        <p><strong>Genre:</strong> ${genres}</p>
        <p><strong>Rating:</strong> ${rating}</p>
        <p><strong>Length:</strong> ${length}</p>
        <button onclick="removeFavorite('${fav.id}', '${fav.type}')">Remove</button>
      </div>
    `;
    favoritesList.appendChild(li);
  });
}


// Saves movie or game to favorite 
window.addToFavorites = function(item, type) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const exists = favorites.find(fav => fav.id === (item.imdbID || item.id) && fav.type === type);
  if (!exists) {
    const favoriteItem = {
      id: item.imdbID || item.id,
      title: item.Title || item.name,
      year: item.Year || item.released,
      poster: item.Poster || item.background_image,
      type: type,
      raw: item
    };
    favorites.push(favoriteItem);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (isFavoritesPage) renderFavorites();
  } else {
    alert(`${exists.title} is already in your favorites.`); // warns user if it is already in favorites
  }
};

// Remove favorite and update local storage
window.removeFavorite = function(id, type) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => !(fav.id === id && fav.type === type));
  localStorage.setItem('favorites', JSON.stringify(favorites));
  if (isFavoritesPage) renderFavorites();
};


// Adds easier way for users to filter favorites
function setupFavoritesFilterListeners() {
  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      updateVisibleFilters();
      renderFavorites();
    });
  }
  if (movieGenreFilter) movieGenreFilter.addEventListener('change', renderFavorites);
  if (movieSortBy) movieSortBy.addEventListener('change', renderFavorites);
  if (gameGenreFilter) gameGenreFilter.addEventListener('change', renderFavorites);
  if (gameSortBy) gameSortBy.addEventListener('change', renderFavorites);
}

if (!movieDetails) {
  modal.style.display = 'none';
}


closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.style.display = 'none';
  }
});

if (modal) {
  modal.style.display = 'none';
  const modalDetails = document.getElementById('modalDetails');
  if (modalDetails) {
    modalDetails.innerHTML = '';
  }
}




document.addEventListener('DOMContentLoaded', () => {
  
  const favoritesLayoutToggle = document.getElementById('favoritesLayoutToggle');

  // Load saved layout preference
  const savedLayout = localStorage.getItem('favoritesLayout') || 'vertical';
  document.body.classList.add(`${savedLayout}-layout`);
  if (favoritesLayoutToggle) {
    favoritesLayoutToggle.checked = savedLayout === 'horizontal';
  }

  // Listen for toggle
  if (favoritesLayoutToggle) {
    favoritesLayoutToggle.addEventListener('change', () => {
      const isHorizontal = favoritesLayoutToggle.checked;

      document.body.classList.remove('vertical-layout', 'horizontal-layout');
      document.body.classList.add(isHorizontal ? 'horizontal-layout' : 'vertical-layout');

      localStorage.setItem('favoritesLayout', isHorizontal ? 'horizontal' : 'vertical');
    });
  }
});

