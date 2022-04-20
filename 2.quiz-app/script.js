const quizData = [
    {
        question: 'How old is Abdulbosit?',
        a: '22',
        b: '17',
        c: '26',
        d: '100',
        correct: 'a'
    },
    {
        question: 'What was the most used programming language in 2021?',
        a: 'Java',
        b: 'C#',
        c: 'Python',
        d: 'JavaScript',
        correct: 'c'
    },
    {
        question: 'What is the capital of Egypt?',
        a: 'Nile',
        b: 'Giza',
        c: 'Cheops',
        d: 'Cairo',
        correct: 'd'
    },
    {
        question: 'Who is the founder of Microsoft?',
        a: 'Abdulbosit',
        b: 'Paul Allen',
        c: 'Bill Gates',
        d: 'Steve Jobs',
        correct: 'c'
    },
    {
        question: 'What does HTML stand for?',
        a: 'Hypertext Markup Language',
        b: 'Cascading Style Sheets',
        c: 'JavaScript Object Notation',
        d: 'North Atlantic Treaty Organization',
        correct: 'a'
    },
    {
        question: 'When was JavaScript launched?',
        a: '1996',
        b: '1995',
        c: '1994',
        d: 'none of the above',
        correct: 'b'
    }
]

const quiz = document.getElementById('quiz')
const answerEls = document.querySelectorAll('.answer')
const questionEl = document.getElementById('question')
const a_text = document.getElementById('a_text')
const b_text = document.getElementById('b_text')
const c_text = document.getElementById('c_text')
const d_text = document.getElementById('d_text')
const submitBtn = document.getElementById('submit')

let currentQuiz = 0
let score = 0

loadQuiz()

function loadQuiz() {
    deselectAnswers()
    const currentQuizData = quizData[currentQuiz]

    questionEl.innerText = currentQuizData.question 
    a_text.innerText = currentQuizData.a
    b_text.innerText = currentQuizData.b
    c_text.innerText = currentQuizData.c
    d_text.innerText = currentQuizData.d

} 

function getSelected() {

    let answer = undefined
    answerEls.forEach(answerEl => {
        if (answerEl.checked) {
            answer =  answerEl.id
        }
    });
    return answer
}

function deselectAnswers(){
    answerEls.forEach(answerEl => {
        if (answerEl.checked) {
            answerEl.checked =  false
        }
    });
}

submitBtn.addEventListener('click', () => {
    const answer = getSelected()
    
    if(answer) {
        if(answer === quizData[currentQuiz].correct){
            score++
        }
        currentQuiz++
            
        if(currentQuiz < quizData.length){
            loadQuiz()
        } else {
            quiz.innerHTML = `
                <h2> You answered correctly at ${score}/${quizData.length} questions</h2>
                <button onclick="location.reload()">Restart</button>
            `
        }
    } 

})