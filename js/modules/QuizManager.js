import Question from './Question.js';

class QuizManager {
    constructor() {
        this.allQuestionsData = [];
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.settings = {
            limit: 20
        };
        // Właściwości dla timera:
        this.timerDuration = 30 * 60; // 30 minut w sekundach
        this.timeLeft = this.timerDuration;
        this.timerIntervalId = null;
        this.onTimerTick = () => {};     // Callback do aktualizacji UI
        this.onTimeExpired = () => {};   // Callback do zakończenia egzaminu
    }

    async loadQuestions() {
        try {
            const response = await fetch('./js/data/questions.json');
            const rawData = await response.json();
            
            // Odczyt tablicy z pola 'questions'
            const questionsArray = rawData.questions || []; 
            
            this.allQuestionsData = questionsArray.map(qData => new Question(qData));
            
            console.log("Załadowano pytań:", this.allQuestionsData.length);
            return true;
        } catch (error) {
            console.error("Błąd ładowania lub parsowania pytań:", error);
            return false;
        }
    }
    
    /**
     * RESETUJE stan quizu (wynik, indeks pytania, timer).
     * Używane przed rozpoczęciem nowej sesji.
     */
    resetQuiz() {
        this.stopTimer();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeLeft = this.timerDuration; // Reset timera
        this.onTimerTick(this.timeLeft); // Aktualizacja UI timera na startową wartość
    }

    /**
     * Przygotowuje pulę pytań dla nowej sesji quizu.
     * @param {string} mode Tryb quizu ('exam' lub 'trening')
     * @param {number} [start] Numer początkowy pytania.
     * @param {number} [end] Numer końcowy pytania.
     */
    startQuiz(mode = 'all', start = 1, end = Infinity) {
        // Logika resetu została przeniesiona do metody resetQuiz(), 
        // ale można ją zostawić tutaj jako zabezpieczenie, jeśli startQuiz 
        // jest wywoływany samodzielnie. W UIManager.js użyliśmy już resetQuiz().

        this.currentQuestionIndex = 0;
        this.score = 0;
        
        let questionsToUse = [...this.allQuestionsData];

        if (mode === 'trening') {
            // Filtrowanie zakresu pytań
            questionsToUse = questionsToUse.filter(q => q.id >= start && q.id <= end);
            this.quizQuestions = questionsToUse;
        } 
        
        else if (mode === 'exam' && questionsToUse.length > this.settings.limit) {
            this._shuffleArray(questionsToUse); 
            this.quizQuestions = questionsToUse.slice(0, this.settings.limit);
            this.startTimer(); // URUCHOMIENIE TIMERA TYLKO DLA EGZAMINU
        }
        
        else {
             this.quizQuestions = questionsToUse;
        }
    }

    getCurrentQuestion() {
        return this.quizQuestions[this.currentQuestionIndex] || null;
    }
    
    checkAnswer(selectedKey) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return false;

        const isCorrect = currentQuestion.checkAnswer(selectedKey);

        if (isCorrect) {
            this.score++;
        }

        this.currentQuestionIndex++; 
        
        // Jeśli to było ostatnie pytanie, zatrzymaj timer
        if (this.isQuizFinished()) {
            this.stopTimer();
        }
        
        return isCorrect;
    }
    
    isQuizFinished() {
        return this.currentQuestionIndex >= this.quizQuestions.length;
    }

    // ---------- LOGIKA TIMERA ----------
    
    startTimer() {
        this.timeLeft = this.timerDuration; 
        this.onTimerTick(this.timeLeft); // Aktualizacja UI od razu
        
        this.timerIntervalId = setInterval(() => {
            this.timeLeft--;
            this.onTimerTick(this.timeLeft); 

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.onTimeExpired(); 
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerIntervalId) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
        }
    }
    // -----------------------------------
    
    getTotalQuestionCount() {
        return this.allQuestionsData.length;
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

export default QuizManager;