import QuizManager from './modules/QuizManager.js';
import UIManager from './modules/UIManager.js';

const initApp = async () => {
    const quizManager = new QuizManager();
    const uiManager = new UIManager();

    const success = await quizManager.loadQuestions();
    
    if (!success) {
        console.error("Aplikacja nie może wystartować - błąd ładowania pytań.");
        return; 
    }

    // ---------- POWIĄZANIA CALLBACKÓW TIMERA ----------
    quizManager.onTimerTick = (timeLeft) => {
        uiManager.updateTimer(timeLeft);
    };

    quizManager.onTimeExpired = () => {
        // Natychmiastowe wyświetlenie wyników z informacją o końcu czasu
        uiManager.showResults(quizManager.score, quizManager.quizQuestions.length, 'expired');
    };
    // --------------------------------------------------

    uiManager.setupEventListeners(quizManager);

    // Domyślne ustawienie timera na starcie (wyświetla 30:00 w menu)
    uiManager.updateTimer(quizManager.timerDuration); 
    
    uiManager.showMenu();
};

document.addEventListener('DOMContentLoaded', initApp);