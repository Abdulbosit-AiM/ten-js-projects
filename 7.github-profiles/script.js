// Enhanced GitHub Profiles Application with Modern JavaScript
class GitHubProfilesApp {
    constructor() {
        this.APIURL = 'https://api.github.com/users/';
        this.elements = {};
        this.currentUser = null;
        this.cache = new Map();
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.getUser('Abdulbosit-AiM'); // Default user
        this.addVisualEffects();
        this.setupKeyboardShortcuts();
    }

    cacheElements() {
        this.elements = {
            main: document.getElementById('main'),
            form: document.getElementById('form'),
            search: document.getElementById('search')
        };
    }

    setupEventListeners() {
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time search with debouncing
        let searchTimeout;
        this.elements.search.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const username = e.target.value.trim();
                if (username && username.length > 2) {
                    this.getUser(username);
                }
            }, 500);
        });

        // Handle enter key in search
        this.elements.search.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Focus search with '/' key
            if (e.key === '/' && !e.target.matches('input')) {
                e.preventDefault();
                this.elements.search.focus();
            }
            
            // Clear search with Escape
            if (e.key === 'Escape') {
                this.elements.search.blur();
                if (this.elements.search.value) {
                    this.elements.search.value = '';
                    this.getUser('Abdulbosit-AiM');
                }
            }
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const user = this.elements.search.value.trim();
        if (user) {
            this.getUser(user);
        }
    }

    async getUser(username) {
        if (this.cache.has(username)) {
            const cachedData = this.cache.get(username);
            this.createUserCard(cachedData.user);
            this.addReposToCard(cachedData.repos);
            return;
        }

        this.showLoading();

        try {
            const [userResp, reposResp] = await Promise.all([
                fetch(this.APIURL + username),
                fetch(this.APIURL + username + '/repos?sort=updated&per_page=10')
            ]);

            if (!userResp.ok) {
                throw new Error(userResp.status === 404 ? 'User not found' : 'Failed to fetch user data');
            }

            const [userData, reposData] = await Promise.all([
                userResp.json(),
                reposResp.json()
            ]);

            // Cache the data
            this.cache.set(username, { user: userData, repos: reposData });
            
            this.currentUser = userData;
            this.createUserCard(userData);
            this.addReposToCard(reposData);

        } catch (error) {
            console.error('Error fetching user data:', error);
            this.showError(error.message);
        }
    }

    showLoading() {
        this.elements.main.innerHTML = '<div class="loading">Loading profile...</div>';
    }

    showError(message) {
        this.elements.main.innerHTML = `
            <div class="error">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="githubApp.getUser('Abdulbosit-AiM')" style="
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: var(--spacing-3) var(--spacing-6);
                    border-radius: var(--border-radius-lg);
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: var(--spacing-4);
                    transition: all var(--transition-fast);
                ">Try Default Profile</button>
            </div>
        `;
    }

    createUserCard(user) {
        const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const cardHTML = `
            <div class="card">    
                <div class="avatar-container">
                    <img class="avatar" src="${user.avatar_url}" alt="${user.name || user.login}">
                    <div class="status-indicator" title="Active on GitHub"></div>
                </div>
                <div class="user-info">
                    <h2>${user.name || user.login}</h2>
                    <span class="username">@${user.login}</span>
                    ${user.bio ? `<p class="bio">${user.bio}</p>` : ''}
                    ${user.location ? `
                        <div class="location">
                            <span>📍</span>
                            <span>${user.location}</span>
                        </div>
                    ` : ''}
                    ${user.blog ? `
                        <div class="location">
                            <span>🔗</span>
                            <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" 
                               target="_blank" rel="noopener" style="color: var(--primary-color);">
                               ${user.blog}
                            </a>
                        </div>
                    ` : ''}
                    <ul class="stats">
                        <li>
                            <span class="number">${user.followers.toLocaleString()}</span>
                            <span class="label">Followers</span>
                        </li>
                        <li>
                            <span class="number">${user.following.toLocaleString()}</span>
                            <span class="label">Following</span>
                        </li>
                        <li>
                            <span class="number">${user.public_repos.toLocaleString()}</span>
                            <span class="label">Repositories</span>
                        </li>
                    </ul>
                    <div class="repos-section">
                        <div class="repos-title">Popular Repositories</div>
                        <div id="repos" class="repos-grid"></div>
                    </div>
                    <div style="margin-top: var(--spacing-6); padding-top: var(--spacing-4); border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.875rem; color: var(--neutral-400);">
                        <span>📅 Joined GitHub on ${joinDate}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.main.innerHTML = cardHTML;
        
        // Add click handler to avatar for profile link
        const avatar = this.elements.main.querySelector('.avatar');
        avatar.addEventListener('click', () => {
            window.open(user.html_url, '_blank', 'noopener');
        });
        
        avatar.style.cursor = 'pointer';
        avatar.title = 'View GitHub Profile';
    }

    addReposToCard(repos) {
        const reposEl = document.getElementById('repos');
        
        if (!repos || repos.length === 0) {
            reposEl.innerHTML = '<p style="color: var(--neutral-400); text-align: center; padding: var(--spacing-4);">No public repositories found.</p>';
            return;
        }

        // Sort repos by stars and take top 6
        const sortedRepos = repos
            .filter(repo => !repo.fork) // Exclude forks
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);

        sortedRepos.forEach((repo, index) => {
            const repoEl = document.createElement('a');
            repoEl.className = 'repo';
            repoEl.href = repo.html_url;
            repoEl.target = '_blank';
            repoEl.rel = 'noopener';
            repoEl.style.animationDelay = `${index * 0.1}s`;

            const updatedDate = new Date(repo.updated_at).toLocaleDateString();
            const language = repo.language || 'Unknown';
            
            repoEl.innerHTML = `
                <div class="repo-name">${repo.name}</div>
                ${repo.description ? `<div style="font-size: 0.75rem; color: var(--neutral-400); margin-bottom: var(--spacing-2); line-height: 1.4;">${repo.description}</div>` : ''}
                <div class="repo-stats">
                    <span class="repo-stat">
                        <span>⭐</span>
                        <span>${repo.stargazers_count}</span>
                    </span>
                    <span class="repo-stat">
                        <span>🍴</span>
                        <span>${repo.forks_count}</span>
                    </span>
                    <span class="repo-stat">
                        <span>💻</span>
                        <span>${language}</span>
                    </span>
                </div>
                <div style="font-size: 0.625rem; color: var(--neutral-500); margin-top: var(--spacing-2);">
                    Updated ${updatedDate}
                </div>
            `;

            // Add hover effect for repo stats
            repoEl.addEventListener('mouseenter', () => {
                const stats = repoEl.querySelectorAll('.repo-stat');
                stats.forEach((stat, i) => {
                    setTimeout(() => {
                        stat.style.transform = 'scale(1.1)';
                        stat.style.color = 'var(--primary-color)';
                    }, i * 50);
                });
            });

            repoEl.addEventListener('mouseleave', () => {
                const stats = repoEl.querySelectorAll('.repo-stat');
                stats.forEach(stat => {
                    stat.style.transform = 'scale(1)';
                    stat.style.color = '';
                });
            });

            reposEl.appendChild(repoEl);
        });
    }

    addVisualEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .repo {
                animation: repoSlideIn 0.6s ease-out both;
            }
            
            @keyframes repoSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .avatar {
                cursor: pointer;
                transition: all var(--transition-normal);
            }
            
            .avatar:hover {
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
            }
            
            .stats li {
                cursor: pointer;
            }
            
            .stats li:hover .number {
                transform: scale(1.1);
                color: var(--secondary-color);
            }
            
            .user-info a {
                transition: all var(--transition-fast);
            }
            
            .user-info a:hover {
                color: var(--secondary-color) !important;
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
let githubApp;
document.addEventListener('DOMContentLoaded', () => {
    githubApp = new GitHubProfilesApp();
});

// Add search suggestions
class SearchSuggestions {
    constructor() {
        this.popularUsers = [
            'torvalds', 'gaearon', 'sindresorhus', 'tj', 'addyosmani',
            'paulirish', 'kentcdodds', 'wesbos', 'bradtraversy', 'mojombo'
        ];
        this.setupSuggestions();
    }

    setupSuggestions() {
        const searchInput = document.getElementById('search');
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--border-radius-lg);
            margin-top: var(--spacing-2);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;

        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(suggestionsContainer);

        searchInput.addEventListener('focus', () => {
            if (!searchInput.value) {
                this.showSuggestions(suggestionsContainer, this.popularUsers);
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });
    }

    showSuggestions(container, users) {
        container.innerHTML = users.map(user => `
            <div class="suggestion-item" style="
                padding: var(--spacing-3) var(--spacing-4);
                cursor: pointer;
                transition: all var(--transition-fast);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            " onclick="document.getElementById('search').value='${user}'; githubApp.getUser('${user}');">
                <span style="font-weight: 500;">@${user}</span>
                <span style="font-size: 0.75rem; color: var(--neutral-400); margin-left: var(--spacing-2);">Popular Developer</span>
            </div>
        `).join('');

        // Add hover effects
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(99, 102, 241, 0.1)';
                item.style.color = 'white';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = '';
                item.style.color = '';
            });
        });

        container.style.display = 'block';
    }
}

// Initialize search suggestions
document.addEventListener('DOMContentLoaded', () => {
    new SearchSuggestions();
});