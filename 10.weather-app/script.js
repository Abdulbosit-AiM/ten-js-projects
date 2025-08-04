// Enhanced Weather Application with Modern JavaScript
class WeatherApp {
    constructor() {
        this.APIKEY = '8cf1a897d9da6aa0a705c0605e394b86';
        this.unsplashApiKey = '6WkK4x_SRvlHrIFrJk7fCLbNuvBL806Fmg-l02KUpqk';
        this.elements = {};
        this.currentLocation = null;
        this.cache = new Map();
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.addVisualEffects();
        this.setupKeyboardShortcuts();
        this.getWeatherByLocation('tashkent'); // Default location
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
                const location = e.target.value.trim();
                if (location && location.length > 2) {
                    this.getWeatherByLocation(location);
                }
            }, 1000);
        });

        // Get user's location
        this.setupGeolocation();
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
                }
            }
            
            // Refresh weather with F5 or Ctrl+R
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                if (this.currentLocation) {
                    e.preventDefault();
                    this.refreshWeather();
                }
            }
        });
    }

    setupGeolocation() {
        // Add geolocation button
        const geoBtn = document.createElement('button');
        geoBtn.className = 'geo-btn';
        geoBtn.innerHTML = '📍';
        geoBtn.title = 'Use my location';
        geoBtn.style.cssText = `
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: var(--spacing-3);
            border-radius: var(--border-radius-lg);
            cursor: pointer;
            transition: all var(--transition-normal);
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 48px;
            height: 48px;
            margin-left: var(--spacing-2);
            backdrop-filter: blur(10px);
            font-size: 1.25rem;
        `;

        geoBtn.addEventListener('click', () => this.getCurrentLocation());
        this.elements.form.appendChild(geoBtn);

        geoBtn.addEventListener('mouseenter', () => {
            geoBtn.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)';
            geoBtn.style.transform = 'scale(1.05)';
        });

        geoBtn.addEventListener('mouseleave', () => {
            geoBtn.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)';
            geoBtn.style.transform = 'scale(1)';
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const location = this.elements.search.value.trim();
        if (location) {
            this.getWeatherByLocation(location);
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation is not supported by this browser', 'error');
            return;
        }

        this.showLoading('Getting your location...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showError('Unable to get your location. Please search manually.');
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

    async getWeatherByCoords(lat, lon) {
        const cacheKey = `coords_${lat}_${lon}`;
        
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < 300000) { // 5 minutes cache
                this.displayWeather(cachedData.data);
                return;
            }
        }

        try {
            const resp = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.APIKEY}`
            );
            
            if (!resp.ok) throw new Error('Weather data not available');
            
            const respData = await resp.json();
            
            this.cache.set(cacheKey, {
                data: respData,
                timestamp: Date.now()
            });
            
            this.currentLocation = respData.name;
            this.elements.search.value = respData.name;
            this.displayWeather(respData);
            await this.fetchBackgroundImage(respData.name);
            
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            this.showError('Unable to get weather for your location');
        }
    }

    async getWeatherByLocation(location) {
        const cacheKey = `location_${location.toLowerCase()}`;
        
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < 300000) { // 5 minutes cache
                this.displayWeather(cachedData.data);
                return;
            }
        }

        this.showLoading(`Getting weather for ${location}...`);

        try {
            const resp = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${this.APIKEY}`
            );

            if (!resp.ok) {
                throw new Error(resp.status === 404 ? 'City not found' : 'Weather data not available');
            }

            const respData = await resp.json();
            
            this.cache.set(cacheKey, {
                data: respData,
                timestamp: Date.now()
            });
            
            this.currentLocation = location;
            this.displayWeather(respData);
            await this.fetchBackgroundImage(location);
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            this.showError(error.message);
        }
    }

    async refreshWeather() {
        if (this.currentLocation) {
            // Clear cache for current location
            const cacheKey = `location_${this.currentLocation.toLowerCase()}`;
            this.cache.delete(cacheKey);
            
            await this.getWeatherByLocation(this.currentLocation);
            this.showNotification('Weather updated!', 'success');
        }
    }

    displayWeather(data) {
        const temp = data.main.temp;
        const location = data.name;
        const country = data.sys.country;
        const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        const description = data.weather[0].description;
        const feelsLike = data.main.feels_like;
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const windSpeed = data.wind.speed;
        const windDeg = data.wind.deg;
        const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A';
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const weather = document.createElement('div');
        weather.className = 'weather';

        weather.innerHTML = `
            <h2 class="weather-location">${location}, ${country}</h2>
            
            <div class="weather-main">
                <img src="${icon}" alt="${description}" class="weather-icon" loading="lazy">
                <div class="weather-temp">${temp.toFixed(1)}°C</div>
            </div>
            
            <div class="weather-description">${description}</div>
            
            <div class="weather-details">
                <div class="weather-detail">
                    <div class="weather-detail-label">Feels Like</div>
                    <div class="weather-detail-value">${feelsLike.toFixed(1)}°C</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Humidity</div>
                    <div class="weather-detail-value">${humidity}%</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Pressure</div>
                    <div class="weather-detail-value">${pressure} hPa</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Wind</div>
                    <div class="weather-detail-value">${windSpeed} m/s</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Visibility</div>
                    <div class="weather-detail-value">${visibility} km</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Sunrise</div>
                    <div class="weather-detail-value">${sunrise}</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Sunset</div>
                    <div class="weather-detail-value">${sunset}</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Updated</div>
                    <div class="weather-detail-value">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
        `;

        this.elements.main.innerHTML = '';
        this.elements.main.appendChild(weather);

        // Update body class for weather condition
        this.updateWeatherBackground(data.weather[0].main.toLowerCase());
        
        // Add click handler for refresh
        weather.addEventListener('click', () => this.refreshWeather());
        weather.style.cursor = 'pointer';
        weather.title = 'Click to refresh weather data';
    }

    updateWeatherBackground(condition) {
        // Remove existing weather classes
        document.body.classList.remove('weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-thunderstorm');
        
        // Add appropriate class based on weather condition
        switch (condition) {
            case 'clear':
                document.body.classList.add('weather-clear');
                break;
            case 'clouds':
                document.body.classList.add('weather-clouds');
                break;
            case 'rain':
            case 'drizzle':
                document.body.classList.add('weather-rain');
                break;
            case 'snow':
                document.body.classList.add('weather-snow');
                break;
            case 'thunderstorm':
                document.body.classList.add('weather-thunderstorm');
                break;
            default:
                document.body.classList.add('weather-clear');
        }
    }

    async fetchBackgroundImage(city) {
        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city + ' city skyline')}&client_id=${this.unsplashApiKey}&per_page=1&orientation=landscape`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const photo = data.results[0];
                const imageUrl = photo.urls.full; // Use full size for better coverage
                const photographerName = photo.user.name;
                const photographerUrl = photo.user.links.html;

                // Set background image
                document.body.style.backgroundImage = `url(${imageUrl})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';

                // Update attribution
                const attribution = document.querySelector('.attribution');
                attribution.innerHTML = `Photo by <a href="${photographerUrl}?utm_source=weather_app&utm_medium=referral" target="_blank" rel="noopener">${photographerName}</a> on <a href="https://unsplash.com?utm_source=weather_app&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`;
                attribution.style.display = 'block';

                // Trigger download event
                await this.triggerUnsplashDownload(photo.id);
            } else {
                // Fallback to default gradient if no image found
                document.body.style.backgroundImage = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #6c5ce7 100%)';
            }
        } catch (error) {
            console.error('Error fetching background image:', error);
            // Fallback to default gradient on error
            document.body.style.backgroundImage = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #6c5ce7 100%)';
        }
    }

    async triggerUnsplashDownload(photoId) {
        try {
            await fetch(`https://api.unsplash.com/photos/${photoId}/download?client_id=${this.unsplashApiKey}`);
        } catch (error) {
            console.error('Error triggering download:', error);
        }
    }

    showLoading(message = 'Loading weather data...') {
        this.elements.main.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
        this.elements.main.innerHTML = `
            <div class="error">
                <h3>⚠️ Weather Unavailable</h3>
                <p>${message}</p>
                <button onclick="weatherApp.getWeatherByLocation('tashkent')" style="
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
                    color: white;
                    border: none;
                    padding: var(--spacing-3) var(--spacing-6);
                    border-radius: var(--border-radius-lg);
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: var(--spacing-4);
                    transition: all var(--transition-fast);
                ">Try Default Location</button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: var(--spacing-6);
            right: var(--spacing-6);
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--error-color)' : 
                        type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
            color: white;
            padding: var(--spacing-3) var(--spacing-5);
            border-radius: var(--border-radius-lg);
            font-weight: 500;
            z-index: 1001;
            animation: notificationSlide 3s ease-out forwards;
            box-shadow: var(--shadow-lg);
            font-size: 0.875rem;
            backdrop-filter: blur(10px);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    addVisualEffects() {
        // Add app header
        const header = document.createElement('div');
        header.className = 'app-header';
        header.innerHTML = `
            <h1 class="app-title">🌤️ Weather App</h1>
            <p class="app-subtitle">Get current weather conditions for any city</p>
        `;
        document.body.insertBefore(header, document.body.firstChild);

        // Wrap form in container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        this.elements.form.parentNode.insertBefore(searchContainer, this.elements.form);
        searchContainer.appendChild(this.elements.form);

        // Add search button if it doesn't exist
        let searchBtn = this.elements.form.querySelector('.search-btn');
        if (!searchBtn) {
            searchBtn = document.createElement('button');
            searchBtn.type = 'submit';
            searchBtn.className = 'search-btn';
            searchBtn.innerHTML = '🔍';
            searchBtn.title = 'Search weather';
            this.elements.form.appendChild(searchBtn);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                0% { transform: translateX(100%); opacity: 0; }
                10%, 90% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            
            .weather-detail {
                animation: detailSlideIn 0.6s ease-out both;
            }
            
            .weather-detail:nth-child(1) { animation-delay: 0.1s; }
            .weather-detail:nth-child(2) { animation-delay: 0.2s; }
            .weather-detail:nth-child(3) { animation-delay: 0.3s; }
            .weather-detail:nth-child(4) { animation-delay: 0.4s; }
            .weather-detail:nth-child(5) { animation-delay: 0.5s; }
            .weather-detail:nth-child(6) { animation-delay: 0.6s; }
            .weather-detail:nth-child(7) { animation-delay: 0.7s; }
            .weather-detail:nth-child(8) { animation-delay: 0.8s; }
            
            @keyframes detailSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
let weatherApp;
document.addEventListener('DOMContentLoaded', () => {
    weatherApp = new WeatherApp();
});