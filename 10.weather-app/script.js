const APIKEY = '8cf1a897d9da6aa0a705c0605e394b86'
const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')

async function getWeatherByLocation(location) {
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${APIKEY}`)
    const respData = await resp.json()

    console.log(respData)
    displayWeather(respData)
} 

function displayWeather(data) {
    const temp = data.main.temp
    const location = data.name
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    const description = data.weather[0].main
    

    const weather = document.createElement('div')
    weather.classList.add('weather')

    weather.innerHTML = `
        <h3>${location}, ${data.sys.country}</h3>
        <h2> 
        <img src="${icon}"/>
        ${temp.toFixed(1)}°C
        </h2>
        <h3>${description} </h3>
        
    `
    main.innerHTML = ''

    main.appendChild(weather)
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const location = search.value
    
    if(location){
        getWeatherByLocation(location)
    }
})

getWeatherByLocation('tashkent')

