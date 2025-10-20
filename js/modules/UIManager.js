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
            // Elementy z index.html (Egzamin)
            resultsButtonsPlaceholder: document.getElementById('results-buttons-placeholder'), 
            examResultsContent: document.getElementById('exam-results-content'), // NOWY KONTENER TREŚCI DLA EGZAMINU
            timerDisplay: document.getElementById('timer-display'), 
            // Elementy z trening.html (Trening)
            treningMenu: document.getElementById('trening-menu'),
        };
        
        // Definicje klas CSS
        this.ANSWER_CLASSES = {
            CORRECT: 'answer-correct',
            INCORRECT: 'answer-incorrect',
            BUTTON: 'answer-button'
        };
    }

// ----------------------------------------------------------------------
// OBSŁUGA ZDARZEŃ
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
        
        // DODANIE OBSŁUGI PRZYCISKU PRZERWIJ EGZAMIN
        const przerwijEgzaminBtn = document.getElementById('przerwij-egzamin-btn');

        if (przerwijEgzaminBtn) {
            przerwijEgzaminBtn.addEventListener('click', () => {
                if (confirm("Czy na pewno chcesz przerwać egzamin i zobaczyć dotychczasowe wyniki?")) {
                    quizManager.przerwijEgzamin(); // Zatrzymuje timer i ustawia koniec
                    this.showResults(
                        quizManager.score, 
                        quizManager.quizQuestions.length, 
                        quizManager, 
                        'exam', 
                        'przerwany' // Nowy status
                    );
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
// ZARZĄDZANIE WIDOKAMI I RENDEROWANIEM TREŚCI
// ----------------------------------------------------------------------

    _hideAllViews() {
         [this.dom.menu, this.dom.quizContainer, this.dom.resultsScreen].forEach(el => {
             if (el) el.style.display = 'none';
         });
         // Ukrycie menu treningowego i placeholderów
         if (this.dom.treningMenu) this.dom.treningMenu.style.display = 'none';
         if (this.dom.resultsButtonsPlaceholder) this.dom.resultsButtonsPlaceholder.style.display = 'none';
         const treningButtons = document.getElementById('trening-results-buttons');
         if (treningButtons) treningButtons.style.display = 'none';
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
        // KLUCZOWA POPRAWKA MOBILNA: Usuwamy focus z ostatnio klikniętego elementu
        if (document.activeElement) {
            document.activeElement.blur(); 
        }
        
        if (quizManager.isQuizFinished()) {
            quizManager.stopTimer(); 
            
            // Określenie trybu
            const mode = document.getElementById('trening-menu') ? 'trening' : 'exam';
            
            this.showResults(quizManager.score, quizManager.quizQuestions.length, quizManager, mode); 
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
    
    showResults(finalScore, totalQuestions, quizManager, mode = 'exam', reason = 'finished') {
        this._hideAllViews();
        if (this.dom.resultsScreen) this.dom.resultsScreen.style.display = 'block';
        
        const percentage = Math.round((finalScore / totalQuestions) * 100);
        
        let headerText = "Koniec Egzaminu";
        if (reason === 'expired') {
            headerText = "⏰ Czas minął! ⏰"; 
        } else if (reason === 'przerwany') { // Nowy nagłówek dla przerwanych egzaminów
            headerText = "Egzamin Przerwany";
        }

        let resultsHTML = '';
        
        // --- Generowanie treści wyników ---
        if (mode === 'exam') {
            const isPassed = percentage >= 80;
            const passFailText = isPassed ? "Egzamin Zdany! 🎉" : "Egzamin niezdany! ❌";
            const passFailClass = isPassed ? 'result-passed' : 'result-failed';
            
            resultsHTML = `
                <h2>${headerText}</h2>
                <h3 class="${passFailClass}">${passFailText}</h3>
                <p id="final-score">Twój wynik: ${finalScore} / ${totalQuestions}</p>
                <p>Procent poprawnych odpowiedzi: ${percentage}%</p>
            `;
            
            // Wstawienie do nowego kontenera treści egzaminu
            if (this.dom.examResultsContent) {
                 this.dom.examResultsContent.innerHTML = resultsHTML;
            } else if (this.dom.resultsScreen) {
                 this.dom.resultsScreen.innerHTML = resultsHTML;
            }

        } else if (mode === 'trening') {
             resultsHTML = `
                <h2>Zakres Treningowy Zakończony!</h2>
                <p id="trening-stats">Twój wynik w tym zakresie: ${finalScore} / ${totalQuestions}</p>
                <p>Procent poprawnych odpowiedzi: ${percentage}%</p>
            `;
            // Wstawienie do nowego kontenera treści treningu
            const contentContainer = document.getElementById('trening-results-content');
            if (contentContainer) contentContainer.innerHTML = resultsHTML;
        }
        
        // --- Warunkowa obsługa przycisków ---
        if (mode === 'exam' && this.dom.resultsButtonsPlaceholder) {
            // Przyciski dla Egzaminu Próbnego
            this.dom.resultsButtonsPlaceholder.innerHTML = `
                <button id="restart-quiz-btn">Spróbuj ponownie</button>
                <button id="go-to-main-menu-btn">Wróć do menu głównego</button>
            `;
            
            // Logika restartu Egzaminu
            document.getElementById('restart-quiz-btn').addEventListener('click', () => {
                quizManager.resetQuiz(); 
                quizManager.startQuiz('exam'); 
                this.showQuiz();
                this.goToNext(quizManager); 
            });

            // Logika powrotu do menu głównego (index.html)
            document.getElementById('go-to-main-menu-btn').addEventListener('click', () => {
                this.showMenu(); 
            });
            
            this.dom.resultsButtonsPlaceholder.style.display = 'flex';
            
        } else if (mode === 'trening') {
            
            // DYNAMICZNE POBRANIE ELEMENTU DLA TRENINGU
            const treningButtonsContainer = document.getElementById('trening-results-buttons');

            if (treningButtonsContainer) { 
                // Przyciski dla Trybu Treningowego
                treningButtonsContainer.innerHTML = `
                    <button id="select-new-range-btn">Wybierz kolejny zakres pytań</button>
                    <button id="go-to-main-menu-trening-btn">Wróć do menu głównego</button>
                `;
                
                // Logika powrotu do wyboru zakresu
                document.getElementById('select-new-range-btn').addEventListener('click', () => {
                    this._hideAllViews();
                    if (this.dom.treningMenu) this.dom.treningMenu.style.display = 'block'; // Powrót do #trening-menu
                });
    
                // Logika powrotu do menu głównego (index.html)
                document.getElementById('go-to-main-menu-trening-btn').addEventListener('click', () => {
                    window.location.href = 'index.html'; 
                });
                
                // USTAWIENIE WIDOCZNOŚCI:
                treningButtonsContainer.style.display = 'flex';
            }
        }
    }


// ----------------------------------------------------------------------
// LOGIKA TIMERA UI
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
// WIZUALNE INFORMACJE ZWROTNE I STANY PRZYCISKÓW
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