// Enhanced Quiz Application with Modern JavaScript
class QuizApp {
    constructor() {
        this.currentQuiz = 0;
        this.score = 0;
        this.quizData = this.initializeQuizData();
        this.elements = {};
        this.userAnswers = [];
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadQuiz();
        this.addVisualEffects();
    }

    initializeQuizData() {
        return [
            {
                question: 'How old is Abdulbosit?',
                a: this.getCurrentAge().toString(),
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
        ];
    }

    getCurrentAge() {
        const birthDate = new Date(2000, 1, 3); // Month is 0-indexed, so 1 = February
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        
        // Adjust age if birthday hasn't occurred yet this year
        if (today.getMonth() < birthDate.getMonth() || 
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    cacheElements() {
        this.elements = {
            quiz: document.getElementById('quiz'),
            answerEls: document.querySelectorAll('.answer'),
            questionEl: document.getElementById('question'),
            aText: document.getElementById('a_text'),
            bText: document.getElementById('b_text'),
            cText: document.getElementById('c_text'),
            dText: document.getElementById('d_text'),
            submitBtn: document.getElementById('submit')
        };
    }

    setupEventListeners() {
        this.elements.submitBtn.addEventListener('click', () => this.handleSubmit());
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add click handlers for answer options
        this.elements.answerEls.forEach((answerEl, index) => {
            const label = answerEl.nextElementSibling;
            if (label) {
                label.addEventListener('click', () => {
                    this.selectAnswer(answerEl);
                    this.animateSelection(label.parentElement);
                });
            }
        });
    }

    handleKeyPress(e) {
        switch(e.key) {
            case '1':
            case 'a':
            case 'A':
                this.selectAnswerByIndex(0);
                break;
            case '2':
            case 'b':
            case 'B':
                this.selectAnswerByIndex(1);
                break;
            case '3':
            case 'c':
            case 'C':
                this.selectAnswerByIndex(2);
                break;
            case '4':
            case 'd':
            case 'D':
                this.selectAnswerByIndex(3);
                break;
            case 'Enter':
                e.preventDefault();
                this.handleSubmit();
                break;
        }
    }

    selectAnswerByIndex(index) {
        if (this.elements.answerEls[index]) {
            this.selectAnswer(this.elements.answerEls[index]);
            this.animateSelection(this.elements.answerEls[index].parentElement.parentElement);
        }
    }

    selectAnswer(answerEl) {
        // Deselect all answers first
        this.elements.answerEls.forEach(el => el.checked = false);
        // Select the clicked answer
        answerEl.checked = true;
    }

    animateSelection(element) {
        element.style.transform = 'scale(1.02)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    loadQuiz() {
        this.deselectAnswers();
        
        if (this.currentQuiz >= this.quizData.length) {
            this.showResults();
            return;
        }

        const currentQuizData = this.quizData[this.currentQuiz];
        
        // Animate question change
        this.elements.questionEl.style.opacity = '0';
        setTimeout(() => {
            this.elements.questionEl.innerText = currentQuizData.question;
            this.elements.aText.innerText = currentQuizData.a;
            this.elements.bText.innerText = currentQuizData.b;
            this.elements.cText.innerText = currentQuizData.c;
            this.elements.dText.innerText = currentQuizData.d;
            
            this.elements.questionEl.style.opacity = '1';
            this.animateAnswers();
        }, 200);

        // Update progress
        this.updateProgress();
    }

    animateAnswers() {
        const answerItems = document.querySelectorAll('ul li');
        answerItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 + (index * 50));
        });
    }

    updateProgress() {
        // Add progress indicator
        let progressBar = document.querySelector('.progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.cssText = `
                position: absolute;
                top: 4px;
                left: 0;
                height: 4px;
                background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                transition: width 0.3s ease-out;
                border-radius: 0 2px 2px 0;
            `;
            this.elements.quiz.appendChild(progressBar);
        }
        
        const progress = ((this.currentQuiz + 1) / this.quizData.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    getSelected() {
        let answer = undefined;
        this.elements.answerEls.forEach(answerEl => {
            if (answerEl.checked) {
                answer = answerEl.id;
            }
        });
        return answer;
    }

    deselectAnswers() {
        this.elements.answerEls.forEach(answerEl => {
            answerEl.checked = false;
        });
    }

    handleSubmit() {
        const answer = this.getSelected();
        
        if (!answer) {
            this.showError('Please select an answer!');
            return;
        }

        // Store user answer
        this.userAnswers.push({
            question: this.quizData[this.currentQuiz].question,
            selected: answer,
            correct: this.quizData[this.currentQuiz].correct,
            isCorrect: answer === this.quizData[this.currentQuiz].correct
        });

        if (answer === this.quizData[this.currentQuiz].correct) {
            this.score++;
            this.showFeedback(true);
        } else {
            this.showFeedback(false);
        }

        // Disable submit button temporarily
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.style.opacity = '0.6';

        setTimeout(() => {
            this.currentQuiz++;
            this.loadQuiz();
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.style.opacity = '1';
        }, 1500);
    }

    showFeedback(isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${isCorrect ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            padding: var(--spacing-4) var(--spacing-6);
            border-radius: var(--border-radius-lg);
            font-weight: 600;
            font-size: 1.125rem;
            z-index: 1000;
            animation: feedbackPop 1.5s ease-out forwards;
            box-shadow: var(--shadow-xl);
        `;
        
        feedback.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect!';
        document.body.appendChild(feedback);

        setTimeout(() => feedback.remove(), 1500);
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.style.cssText = `
            background: var(--error-color);
            color: white;
            padding: var(--spacing-3) var(--spacing-4);
            border-radius: var(--border-radius-md);
            margin-top: var(--spacing-4);
            text-align: center;
            font-weight: 500;
            animation: shake 0.5s ease-out;
        `;
        
        error.textContent = message;
        this.elements.quiz.appendChild(error);

        setTimeout(() => error.remove(), 3000);
    }

    showResults() {
        const percentage = Math.round((this.score / this.quizData.length) * 100);
        const grade = this.getGrade(percentage);
        
        this.elements.quiz.innerHTML = `
            <div class="quiz-results fade-in">
                <h2>Quiz Complete! 🎉</h2>
                <div class="score-display">${this.score}/${this.quizData.length}</div>
                <p style="font-size: 1.25rem; margin: var(--spacing-4) 0; color: var(--neutral-600);">
                    You scored ${percentage}% - ${grade.message}
                </p>
                <div class="grade-indicator" style="
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: ${grade.color};
                    margin: var(--spacing-6) auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: white;
                    font-weight: 800;
                    animation: pulse 2s ease-in-out infinite;
                ">${grade.letter}</div>
                <button onclick="location.reload()" class="restart-button">
                    Take Quiz Again
                </button>
                <button onclick="window.showDetailedResults()" class="restart-button" style="
                    background: linear-gradient(135deg, var(--neutral-600) 0%, var(--neutral-700) 100%);
                    margin-top: var(--spacing-3);
                ">
                    View Detailed Results
                </button>
            </div>
        `;

        // Store results for detailed view
        window.quizResults = this.userAnswers;
        window.showDetailedResults = () => this.showDetailedResults();

        this.celebrateCompletion(percentage);
    }

    getGrade(percentage) {
        if (percentage >= 90) return { letter: 'A+', message: 'Excellent!', color: 'var(--success-color)' };
        if (percentage >= 80) return { letter: 'A', message: 'Great job!', color: 'var(--secondary-color)' };
        if (percentage >= 70) return { letter: 'B', message: 'Good work!', color: 'var(--primary-color)' };
        if (percentage >= 60) return { letter: 'C', message: 'Not bad!', color: 'var(--accent-color)' };
        if (percentage >= 50) return { letter: 'D', message: 'You can do better!', color: 'var(--warning-color)' };
        return { letter: 'F', message: 'Keep studying!', color: 'var(--error-color)' };
    }

    showDetailedResults() {
        let detailsHTML = '<div class="detailed-results fade-in"><h2>Detailed Results</h2>';
        
        this.userAnswers.forEach((answer, index) => {
            const questionData = this.quizData[index];
            detailsHTML += `
                <div class="result-item" style="
                    margin: var(--spacing-4) 0;
                    padding: var(--spacing-4);
                    border-radius: var(--border-radius-lg);
                    border-left: 4px solid ${answer.isCorrect ? 'var(--success-color)' : 'var(--error-color)'};
                    background: var(--neutral-50);
                ">
                    <h4 style="margin: 0 0 var(--spacing-2); color: var(--neutral-800);">
                        Question ${index + 1}: ${answer.question}
                    </h4>
                    <p style="margin: var(--spacing-1) 0; color: var(--neutral-600);">
                        Your answer: <strong>${questionData[answer.selected]}</strong>
                        ${answer.isCorrect ? '✓' : '✗'}
                    </p>
                    ${!answer.isCorrect ? `
                        <p style="margin: var(--spacing-1) 0; color: var(--success-color);">
                            Correct answer: <strong>${questionData[answer.correct]}</strong>
                        </p>
                    ` : ''}
                </div>
            `;
        });
        
        detailsHTML += `
            <button onclick="location.reload()" class="restart-button">
                Try Again
            </button>
        </div>`;
        
        this.elements.quiz.innerHTML = detailsHTML;
    }

    celebrateCompletion(percentage) {
        if (percentage >= 80) {
            this.createConfetti();
        }
    }

    createConfetti() {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    animation: confettiFall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 100);
        }
    }

    addVisualEffects() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
            
            @keyframes feedbackPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});