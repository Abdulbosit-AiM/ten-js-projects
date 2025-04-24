const APIKEY = '8cf1a897d9da6aa0a705c0605e394b86';
const unsplashApiKey = '6WkK4x_SRvlHrIFrJk7fCLbNuvBL806Fmg-l02KUpqk'; // Replace with your Unsplash Access Key
const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

// Function to trigger download event for Unsplash photo
async function triggerUnsplashDownload(photoId) {
  try {
    await fetch(`https://api.unsplash.com/photos/${photoId}/download?client_id=${unsplashApiKey}`);
  } catch (error) {
    console.error('Error triggering download:', error);
  }
}

// Function to fetch background image from Unsplash based on city
async function fetchBackgroundImage(city) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&client_id=${unsplashApiKey}&per_page=1&orientation=landscape`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      const imageUrl = photo.urls.full; // Hotlink to Unsplash image
      const photographerName = photo.user.name;
      const photographerUrl = photo.user.links.html;
      const photoId = photo.id;

      // Set background image
      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';

      // Update attribution
      const attribution = document.querySelector('.attribution');
      attribution.innerHTML = `Photo by <a href="${photographerUrl}?utm_source=weather_app&utm_medium=referral" target="_blank">${photographerName}</a> on <a href="https://unsplash.com?utm_source=weather_app&utm_medium=referral" target="_blank">Unsplash</a>`;
      attribution.style.display = 'block';

      // Trigger download event
      await triggerUnsplashDownload(photoId);
    } else {
      // Fallback background
      document.body.style.backgroundImage = 'url("default-background.jpg")';
      document.querySelector('.attribution').style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching background image:', error);
    document.body.style.backgroundImage = 'url("default-background.jpg")';
    document.querySelector('.attribution').style.display = 'none';
  }
}

// Fetch weather data and update background
async function getWeatherByLocation(location) {
  try {
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${APIKEY}`);
    const respData = await resp.json();

    if (respData.cod !== 200) {
      throw new Error(respData.message || 'City not found');
    }

    console.log(respData);
    displayWeather(respData);
    await fetchBackgroundImage(location); // Fetch city-specific background
  } catch (error) {
    console.error('Error fetching weather data:', error);
    main.innerHTML = '<p class="error">City not found</p>';
    document.body.style.backgroundImage = 'url("default-background.jpg")';
    document.querySelector('.attribution').style.display = 'none';
  }
}

// Display weather data
function displayWeather(data) {
  const temp = data.main.temp;
  const location = data.name;
  const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const description = data.weather[0].main;

  const weather = document.createElement('div');
  weather.classList.add('weather');

  weather.innerHTML = `
    <h3>${location}, ${data.sys.country}</h3>
    <h2>
      <img src="${icon}"/>
      ${temp.toFixed(1)}°C
    </h2>
    <h3>${description}</h3>
  `;

  main.innerHTML = '';
  main.appendChild(weather);
}

// Event listener for form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const location = search.value.trim();
  if (location) {
    getWeatherByLocation(location);
  }
});

// Initial load
getWeatherByLocation('tashkent');