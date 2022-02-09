const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=44346d7d3ab51accb2a7fa7cbd937920'
const IMGPATH = 'https://image.tmdb.org/t/p/w1280'

const main = document.querySelector('main')
const form = document.querySelector('form')

getMovies() 

async function getMovies() {
    const resp = await fetch(API_URL)
    const respData = await resp.json()

    console.log(respData)

    respData.results.forEach(movie => {
        const { poster_path, title, vote_average } = movie
        const movieEl = document.createElement('div')
        movieEl.classList.add('movie')

        movieEl.innerHTML = `
            <img src="${IMGPATH + poster_path}" alt="${title}">

            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRating(vote_average)}">${vote_average}</span>
            </div>
        `
        main.appendChild(movieEl)  
    });

    return respData
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


