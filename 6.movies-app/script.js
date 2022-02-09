const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=44346d7d3ab51accb2a7fa7cbd937920'
const IMGPATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCHAPI = 'https://api.themoviedb.org/3/search/movie?&api_key=44346d7d3ab51accb2a7fa7cbd937920&query='

const main = document.querySelector('main')
const form = document.querySelector('form')
const search = document.querySelector('#search')

getMovies(API_URL) 

async function getMovies(url) {
    const resp = await fetch(url)
    const respData = await resp.json()

    showMovies(respData.results)

}

function getClassByRating(vote) {
    if(vote >= 8){
        return 'green'
    } else if(vote >= 5) {
        return 'orange'
    } else {
        return 'red'
    }
}

function showMovies(movies) {
    main.innerHTML = ''
    movies.forEach(movie => {
        const { poster_path, title, vote_average, overview, backdrop_path } = movie
        if(poster_path){
            const movieEl = document.createElement('div')
            movieEl.classList.add('movie')
    
            movieEl.innerHTML = `
                <img src="${IMGPATH + poster_path}" alt="${title}">
    
                <div class="movie-info">
                    <h3>${title}</h3>
                    <span class="${getClassByRating(vote_average)}">${vote_average}</span>
                </div>
                <div class="overview">
                    <h4>${title}</h4>
                    <img src="${IMGPATH + backdrop_path}" alt="${title}">
                    <h4>Overview: </h4>
                    ${overview} 
                </div>
            `
            main.appendChild(movieEl)  
        }
    });

}

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const searchTerm = search.value

    if(searchTerm){
        getMovies(SEARCHAPI + searchTerm) 

        search.value = ''
    }
})