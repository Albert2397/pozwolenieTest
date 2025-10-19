/**
 * Klasa zarządzająca interfejsem użytkownika (DOM) aplikacji.
 * UWAGA: Poniższy kod zawiera logikę sprawdzania wyniku dla Egzaminu Próbnego.
 */
class UIManager {
    constructor() {
        // Mapowanie kluczowych elementów DOM
        this.dom = {
            menu: document.getElementById('menu'),
            quizContainer: document.getElementById('quiz-container'),
            questionText: document.getElementById('question-text'),
            answersContainer: document.getElementById('answers-container'),
            scoreDisplay: document.getElementById('score-display'),
            resultsScreen: document.getElementById('results-screen'),
            startQuizButton: document.getElementById('start-quiz-button'),
            restartButtonPlaceholder: document.getElementById('restart-button-placeholder'), 
            timerDisplay: document.getElementById('timer-display'), 
        };
        
        // Definicje klas CSS
        this.ANSWER_CLASSES = {
            CORRECT: 'answer-correct',
            INCORRECT: 'answer-incorrect',
            BUTTON: 'answer-button'
        };
    }

// ----------------------------------------------------------------------
// OBSŁUGA ZDARZEŃ (Bez zmian)
// ----------------------------------------------------------------------

    setupEventListeners(quizManager) {
        this.dom.answersContainer.addEventListener('click', (event) => {
            const button = event.target.closest(`.${this.ANSWER_CLASSES.BUTTON}`); 
            if (!button || button.disabled) return;

            this.handleAnswerClick(button.dataset.key, quizManager);
        });

        if (this.dom.startQuizButton) {
            this.dom.startQuizButton.addEventListener('click', () => {
                 quizManager.startQuiz('exam');
                 this.showQuiz();
                 this.goToNext(quizManager);
            });
        }
        
        if (this.dom.restartButtonPlaceholder) {
            this.dom.restartButtonPlaceholder.addEventListener('click', (event) => {
                if (event.target.id === 'restart-button') {
                    window.location.href = 'index.html'; 
                }
            });
        }
    }

    handleAnswerClick(selectedKey, quizManager) {
        const currentQuestion = quizManager.getCurrentQuestion();
        this.disableAnswerButtons();
        
        const isCorrect = quizManager.checkAnswer(selectedKey);

        this.highlightAnswer(selectedKey, isCorrect, currentQuestion.correctKey);
        
        setTimeout(() => {
            this.clearHighlights();
            this.goToNext(quizManager);
        }, 1500);
    }


// ----------------------------------------------------------------------
// ZARZĄDZANIE WIDOKAMI I RENDEROWANIE TREŚCI (Bez zmian w logice)
// ----------------------------------------------------------------------

    _hideAllViews() {
         [this.dom.menu, this.dom.quizContainer, this.dom.resultsScreen].forEach(el => {
             if (el) el.style.display = 'none';
         });
         const treningMenu = document.getElementById('trening-menu');
         if (treningMenu) treningMenu.style.display = 'none';
    }
    
    showMenu() {
        this._hideAllViews();
        if (this.dom.menu) this.dom.menu.style.display = 'block';
    }

    showQuiz() {
        this._hideAllViews();
        if (this.dom.quizContainer) this.dom.quizContainer.style.display = 'block';
    }
    
    goToNext(quizManager) {
        if (quizManager.isQuizFinished()) {
            quizManager.stopTimer(); 
            this.showResults(quizManager.score, quizManager.quizQuestions.length);
        } else {
            const nextQuestion = quizManager.getCurrentQuestion();
            this.renderQuestion(nextQuestion, quizManager.currentQuestionIndex, quizManager.quizQuestions.length);
            this.updateScore(quizManager.score); 
        }
    }

    renderQuestion(question, current, total) {
        if (!this.dom.questionText || !this.dom.answersContainer) return;
        
        this.dom.questionText.textContent = `${current + 1}/${total}. ${question.text}`;

        this.dom.answersContainer.innerHTML = '';
        
        question.getAnswers().forEach(answer => { 
            const key = answer.label.toUpperCase(); 
            
            const answerButton = document.createElement('button');
            answerButton.className = this.ANSWER_CLASSES.BUTTON;
            answerButton.dataset.key = key; 
            
            answerButton.textContent = `${key}: ${answer.text}`;
            this.dom.answersContainer.appendChild(answerButton);
        });
        
        this.enableAnswerButtons();
    }
    
    updateScore(score) {
        if (this.dom.scoreDisplay) {
            this.dom.scoreDisplay.textContent = `Wynik: ${score}`;
        }
    }
    
    /**
     * Wyświetla ekran wyników końcowych.
     * Dodano logikę sprawdzania wyniku (>= 80% to zdany).
     */
    showResults(finalScore, totalQuestions, reason = 'finished') {
        this._hideAllViews();
        if (this.dom.resultsScreen) this.dom.resultsScreen.style.display = 'block';
        
        const percentage = Math.round((finalScore / totalQuestions) * 100);
        
        let headerText = "Koniec Egzaminu";
        if (reason === 'expired') {
            headerText = "⏰ Czas minął! ⏰"; 
        }

        // LOGIKA ZDANIA/NIEZDANIA
        const isPassed = percentage >= 80;
        const passFailText = isPassed ? "Egzamin Zdany! 🎉" : "Egzamin niezdany! ❌";
        const passFailClass = isPassed ? 'result-passed' : 'result-failed';
        
        if (this.dom.resultsScreen) {
            this.dom.resultsScreen.innerHTML = `
                <h2>${headerText}</h2>
                
                <h3 class="${passFailClass}">${passFailText}</h3>
                
                <p>Twój wynik: ${finalScore} / ${totalQuestions}</p>
                <p>Procent poprawnych odpowiedzi: ${percentage}%</p>
            `;
        }
        
        if (this.dom.restartButtonPlaceholder) {
            this.dom.restartButtonPlaceholder.innerHTML = '<button id="restart-button">Spróbuj ponownie</button>';
        }
    }


// ----------------------------------------------------------------------
// LOGIKA TIMERA UI (Bez zmian)
// ----------------------------------------------------------------------

    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const format = (val) => String(val).padStart(2, '0');
        return `${format(minutes)}:${format(seconds)}`;
    }

    updateTimer(timeLeftInSeconds) {
        if (this.dom.timerDisplay) {
            this.dom.timerDisplay.textContent = `Czas: ${this.formatTime(timeLeftInSeconds)}`;
        }
    }
    
// ----------------------------------------------------------------------
// WIZUALNE INFORMACJE ZWROTNE I STANY PRZYCISKÓW (Bez zmian)
// ----------------------------------------------------------------------

    highlightAnswer(selectedKey, isCorrect, correctKey) {
        const selectedButton = document.querySelector(`.${this.ANSWER_CLASSES.BUTTON}[data-key="${selectedKey}"]`);
        if (selectedButton) {
             selectedButton.classList.add(isCorrect ? this.ANSWER_CLASSES.CORRECT : this.ANSWER_CLASSES.INCORRECT);
        }

        if (!isCorrect) {
            const correctButton = document.querySelector(`.${this.ANSWER_CLASSES.BUTTON}[data-key="${correctKey}"]`);
            if (correctButton) {
                correctButton.classList.add(this.ANSWER_CLASSES.CORRECT);
            }
        }
    }

    clearHighlights() {
        this.dom.answersContainer.querySelectorAll(`.${this.ANSWER_CLASSES.BUTTON}`).forEach(btn => {
            btn.classList.remove(this.ANSWER_CLASSES.CORRECT, this.ANSWER_CLASSES.INCORRECT);
        });
    }

    disableAnswerButtons() {
        this.dom.answersContainer.querySelectorAll(`.${this.ANSWER_CLASSES.BUTTON}`).forEach(btn => btn.disabled = true);
    }

    enableAnswerButtons() {
        this.dom.answersContainer.querySelectorAll(`.${this.ANSWER_CLASSES.BUTTON}`).forEach(btn => btn.disabled = false);
    }
}

export default UIManager;