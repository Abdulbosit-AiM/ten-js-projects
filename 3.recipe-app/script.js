const mealsEl = document.getElementById('meals')
const favouriteContainer = document.getElementById('fav-meals')
const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')
const mealPopup = document.getElementById('popup-meal')
const popupCloseBtn = document.getElementById('close-popup')
const mealInfoEl = document.getElementById('meal-info')

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
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)

    const respData = await resp.json()
    const meal = respData.meals

    return meal
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

    meal.addEventListener('click', () => {
        showMealInfo(mealData)
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

    favMeal.addEventListener('click', () => {
        showMealInfo(mealData)
    })

    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal)

        fetchFavMeals()
    })

    favouriteContainer.appendChild(favMeal)
}

function showMealInfo(mealData) {
    mealInfoEl.innerHTML = ''
    const mealEl = document.createElement('div')

    const ingredients = []

    for(let i = 0; i <= 20; i++){
        if(mealData['strIngredient' + i]){
            ingredients.push(`
                ${mealData['strIngredient' + i]} 
                - ${mealData['strMeasure' + i]} 
            `)
        } else { break }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}">
        <p>
            ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => `
                <li>${ing}</li>
            `).join('')}
        </ul>
    `
  

    mealInfoEl.appendChild(mealEl)
    // show popup
    mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener('click', async () =>{
    // clean container
    mealsEl.innerHTML = ''
    const search = searchTerm.value

    const meals = await getMealsBySearch(search)

    if(meals){
        meals.forEach((meal) => {
            addMeal(meal)
        })
    }
})

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')
})