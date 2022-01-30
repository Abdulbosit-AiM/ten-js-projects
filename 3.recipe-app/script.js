const meals = document.getElementById('meals')
const favouriteContainer = document.getElementById('fav-meals')

getRandomMeal()
fetchFavMeals()

async function getRandomMeal(){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const respData = await resp.json()
    const randomMeal = respData.meals[0]

    // console.log(randomMeal)
    // loadRandomMeal()

    addMeal(randomMeal, true)
}

async function getMealById(id){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)

    const respData = await resp.json()
    const meal = respData.meals[0]

    return meal

}

async function getMealsBySearch(term){
    const meals = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)
}

function addMeal(mealData, random = false){
    const meal = document.createElement('div')
    meal.classList.add('meal')

    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random"> Random Recipe</span>`
            : ''}
            <img src="${mealData.strMealThumb}" 
                alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `

    const btn = meal.querySelector('.meal-body .fav-btn')

    btn.addEventListener('click', () => {
       if( btn.classList.contains('active')) {
           removeMealLS(mealData.idMeal)
           btn.classList.remove('active')
       }else {
           addMealLS(mealData.idMeal)
           btn.classList.add('active')
       }

       fetchFavMeals()
    })

    meals.appendChild(meal)
}

function addMealLS(mealID){
    const mealIDs = getMealLS()

    localStorage.setItem('mealIDs', 
        JSON.stringify([...mealIDs, mealID])
    )
}

function removeMealLS(mealID){
    const mealIDs = getMealLS()

    localStorage.setItem(
        'mealIDs', 
        JSON.stringify(mealIDs.filter((id) => id !== mealID))
    )
}

function getMealLS(){
    const mealIDs = JSON.parse(
        localStorage.getItem('mealIDs')
    )

    return mealIDs === null ? [] : mealIDs
}

async function fetchFavMeals() {
    // clean the container
    favouriteContainer.innerHTML = ''

    const mealIDs = getMealLS()

    for(let i = 0;i <  mealIDs.length; i++ ){
        const mealID = mealIDs[i]
        let meal = await getMealById(mealID)

        addMealFav(meal)
    }

}

function addMealFav(mealData){
    const favMeal = document.createElement('li')

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear">
            <i class="fas fa-times"></i>
        </button>
    `

    const btn = favMeal.querySelector('.clear')

    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal)

        fetchFavMeals()
    })

    favouriteContainer.appendChild(favMeal)
}