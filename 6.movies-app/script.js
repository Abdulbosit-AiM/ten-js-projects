// Enhanced Movies Application with Modern JavaScript
class MoviesApp {
    constructor() {
        this.API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=44346d7d3ab51accb2a7fa7cbd937920';
        this.IMGPATH = 'https://image.tmdb.org/t/p/w1280';
        this.SEARCHAPI = 'https://api.themoviedb.org/3/search/movie?&api_key=44346d7d3ab51accb2a7fa7cbd937920&query=';
        
        this.elements = {};
        this.currentMovies = [];
        this.currentPage = 1;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.getMovies(this.API_URL);
        this.addVisualEffects();
        this.setupInfiniteScroll();
    }

    cacheElements() {
        this.elements = {
            main: document.querySelector('main'),
            form: document.querySelector('form'),
            search: document.querySelector('#search')
        };
    }

    setupEventListeners() {
        this.elements.form.addEventListener('submit', (e) => this.handleSearch(e));
        
        // Real-time search with debouncing
        let searchTimeout;
        this.elements.search.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.trim()) {
                    this.searchMovies(e.target.value.trim());
                } else {
                    this.getMovies(this.API_URL);
                }
            }, 500);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input')) {
                e.preventDefault();
                this.elements.search.focus();
            }
            if (e.key === 'Escape') {
                this.elements.search.blur();
                this.clearSearch();
            }
        });
    }

    setupInfiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    this.loadMoreMovies();
                }
            });
        }, { threshold: 0.1 });

        // Create sentinel element
        const sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        sentinel.style.height = '20px';
        document.body.appendChild(sentinel);
        observer.observe(sentinel);
    }

    async getMovies(url, append = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(!append);

        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Failed to fetch movies');
            
            const respData = await resp.json();
            
            if (append) {
                this.currentMovies = [...this.currentMovies, ...respData.results];
            } else {
                this.currentMovies = respData.results;
            }
            
            this.showMovies(this.currentMovies, append);
            this.hideLoading();
        } catch (error) {
            console.error('Error fetching movies:', error);
            this.showError('Failed to load movies. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    async searchMovies(term) {
        this.currentPage = 1;
        await this.getMovies(this.SEARCHAPI + encodeURIComponent(term));
    }

    async loadMoreMovies() {
        this.currentPage++;
        const searchTerm = this.elements.search.value.trim();
        const url = searchTerm 
            ? `${this.SEARCHAPI}${encodeURIComponent(searchTerm)}&page=${this.currentPage}`
            : `${this.API_URL}&page=${this.currentPage}`;
        
        await this.getMovies(url, true);
    }

    handleSearch(e) {
        e.preventDefault();
        const searchTerm = this.elements.search.value.trim();
        
        if (searchTerm) {
            this.searchMovies(searchTerm);
        } else {
            this.getMovies(this.API_URL);
        }
    }

    clearSearch() {
        this.elements.search.value = '';
        this.getMovies(this.API_URL);
    }

    showMovies(movies, append = false) {
        if (!append) {
            this.elements.main.innerHTML = '';
        }

        if (movies.length === 0) {
            this.showEmptyState();
            return;
        }

        movies.forEach((movie, index) => {
            if (movie.poster_path) {
                this.createMovieElement(movie, append ? index : index);
            }
        });
    }

    createMovieElement(movie, index) {
        const { poster_path, title, vote_average, overview, backdrop_path, release_date, genre_ids } = movie;
        
        const movieEl = document.createElement('div');
        movieEl.className = 'movie';
        movieEl.style.animationDelay = `${(index % 10) * 0.1}s`;

        const rating = this.getRatingClass(vote_average);
        const releaseYear = release_date ? new Date(release_date).getFullYear() : 'N/A';
        
        movieEl.innerHTML = `
            <img src="${this.IMGPATH + poster_path}" 
                 alt="${title}" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image'">

            <div class="movie-info">
                <h3>${title}</h3>
                <span class="rating ${rating.class}" title="Rating: ${vote_average}/10">
                    ${vote_average.toFixed(1)}
                </span>
            </div>
            
            <div class="overview">
                <h4>${title}</h4>
                ${backdrop_path ? `
                    <img src="${this.IMGPATH + backdrop_path}" 
                         alt="${title} backdrop" 
                         class="backdrop"
                         loading="lazy">
                ` : ''}
                
                <div class="meta-info">
                    <div class="meta-item">
                        <div class="label">Year</div>
                        <div class="value">${releaseYear}</div>
                    </div>
                    <div class="meta-item">
                        <div class="label">Rating</div>
                        <div class="value">${vote_average.toFixed(1)}/10</div>
                    </div>
                    <div class="meta-item">
                        <div class="label">Popularity</div>
                        <div class="value">${Math.round(movie.popularity)}</div>
                    </div>
                </div>
                
                <div class="section-title">📖 Overview</div>
                <p>${overview || 'No overview available for this movie.'}</p>
                
                ${movie.adult ? '<div class="adult-warning">🔞 Adult Content</div>' : ''}
            </div>
        `;

        // Add click handler for movie details
        movieEl.addEventListener('click', () => {
            this.showMovieDetails(movie);
        });

        // Add keyboard navigation
        movieEl.setAttribute('tabindex', '0');
        movieEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showMovieDetails(movie);
            }
        });

        this.elements.main.appendChild(movieEl);
    }

    getRatingClass(vote_average) {
        if (vote_average >= 8) {
            return { class: 'excellent', label: 'Excellent' };
        } else if (vote_average >= 6) {
            return { class: 'good', label: 'Good' };
        } else {
            return { class: 'poor', label: 'Poor' };
        }
    }

    showMovieDetails(movie) {
        // Create modal for movie details
        const modal = document.createElement('div');
        modal.className = 'movie-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: var(--spacing-4);
            animation: modalFadeIn 0.3s ease-out;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
            border-radius: var(--border-radius-xl);
            padding: var(--spacing-8);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: var(--shadow-xl);
        `;

        const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`;

        modalContent.innerHTML = `
            <button class="close-modal" style="
                position: absolute;
                top: var(--spacing-4);
                right: var(--spacing-4);
                background: var(--error-color);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
            ">×</button>
            
            <div style="display: grid; grid-template-columns: 300px 1fr; gap: var(--spacing-6); align-items: start;">
                <img src="${this.IMGPATH + movie.poster_path}" 
                     alt="${movie.title}"
                     style="width: 100%; border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg);">
                
                <div>
                    <h2 style="margin: 0 0 var(--spacing-4); font-size: 2rem; color: white;">${movie.title}</h2>
                    <div style="display: flex; gap: var(--spacing-4); margin-bottom: var(--spacing-6);">
                        <span class="rating ${this.getRatingClass(movie.vote_average).class}" style="
                            padding: var(--spacing-2) var(--spacing-4);
                            border-radius: var(--border-radius-lg);
                            font-weight: 700;
                        ">${movie.vote_average.toFixed(1)}/10</span>
                        <span style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: var(--spacing-2) var(--spacing-4);
                            border-radius: var(--border-radius-lg);
                            color: white;
                        ">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    </div>
                    <p style="line-height: 1.6; color: var(--neutral-200); margin-bottom: var(--spacing-6);">
                        ${movie.overview || 'No overview available for this movie.'}
                    </p>
                    <a href="${trailerUrl}" target="_blank" class="trailer-btn">
                        🎬 Watch Trailer
                    </a>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-4);">
                        <div class="meta-item">
                            <div class="label">Popularity</div>
                            <div class="value">${Math.round(movie.popularity)}</div>
                        </div>
                        <div class="meta-item">
                            <div class="label">Vote Count</div>
                            <div class="value">${movie.vote_count.toLocaleString()}</div>
                        </div>
                        <div class="meta-item">
                            <div class="label">Language</div>
                            <div class="value">${movie.original_language.toUpperCase()}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    showLoading(clear = true) {
        if (clear) {
            this.elements.main.innerHTML = '<div class="loading">Loading movies...</div>';
        }
    }

    hideLoading() {
        const loading = this.elements.main.querySelector('.loading');
        if (loading) loading.remove();
    }

    showError(message) {
        this.elements.main.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚠️</div>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: var(--spacing-3) var(--spacing-6);
                    border-radius: var(--border-radius-lg);
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: var(--spacing-4);
                    transition: all var(--transition-fast);
                " onmouseover="this.style.background='var(--primary-hover)'"
                   onmouseout="this.style.background='var(--primary-color)'">
                    Try Again
                </button>
            </div>
        `;
    }

    showEmptyState() {
        const searchTerm = this.elements.search.value.trim();
        this.elements.main.innerHTML = `
            <div class="empty-state">
                <div class="icon">🎬</div>
                <h3>${searchTerm ? 'No movies found' : 'No movies available'}</h3>
                <p>${searchTerm 
                    ? `No results found for "${searchTerm}". Try a different search term.`
                    : 'Unable to load movies at this time.'
                }</p>
                ${searchTerm ? `
                    <button onclick="document.querySelector('#search').value = ''; moviesApp.getMovies(moviesApp.API_URL);" style="
                        background: var(--primary-color);
                        color: white;
                        border: none;
                        padding: var(--spacing-3) var(--spacing-6);
                        border-radius: var(--border-radius-lg);
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: var(--spacing-4);
                        transition: all var(--transition-fast);
                    ">Show All Movies</button>
                ` : ''}
            </div>
        `;
    }

    addVisualEffects() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .movie-modal .meta-item {
                background: rgba(255, 255, 255, 0.05);
                padding: var(--spacing-3);
                border-radius: var(--border-radius-md);
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .movie-modal .meta-item .label {
                font-size: 0.75rem;
                color: var(--neutral-400);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: var(--spacing-1);
            }
            
            .movie-modal .meta-item .value {
                font-weight: 600;
                color: white;
                font-size: 0.875rem;
            }
            
            .adult-warning {
                background: var(--error-color);
                color: white;
                padding: var(--spacing-2) var(--spacing-4);
                border-radius: var(--border-radius-md);
                font-size: 0.875rem;
                font-weight: 600;
                margin-top: var(--spacing-4);
                text-align: center;
            }
            
            @media (max-width: 768px) {
                .movie-modal > div > div {
                    grid-template-columns: 1fr !important;
                    text-align: center;
                }
                
                .movie-modal img {
                    max-width: 250px;
                    margin: 0 auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
let moviesApp;
document.addEventListener('DOMContentLoaded', () => {
    moviesApp = new MoviesApp();
});