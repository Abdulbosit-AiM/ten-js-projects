const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=44346d7d3ab51accb2a7fa7cbd937920'
const IMGPATH = ''


async function getMovies() {
    const resp = await fetch(API_URL)
    const respData = await resp.json()

    console.log(respData)

    return respData
}

getMovies()