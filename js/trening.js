import QuizManager from './modules/QuizManager.js';
import UIManager from './modules/UIManager.js';

const quizManager = new QuizManager();
const uiManager = new UIManager();

const QUESTIONS_PER_RANGE = 10; // Ilość pytań w jednym zakresie

// Funkcja generująca przyciski zakresu w #range-buttons-container
const generateRangeButtons = () => {
    const totalCount = quizManager.getTotalQuestionCount();
    const container = document.getElementById('range-buttons-container');
    if (!container) return;

    container.innerHTML = ''; // Wyczyść kontener

    // 1. Opcja "Wszystkie pytania"
    const allButton = document.createElement('button');
    allButton.textContent = "Wszystkie Pytania";
    allButton.dataset.start = 1;
    allButton.dataset.end = totalCount;
    container.appendChild(allButton);
    
    // 2. Generowanie zakresów po 10
    for (let start = 1; start <= totalCount; start += QUESTIONS_PER_RANGE) {
        const end = Math.min(start + QUESTIONS_PER_RANGE - 1, totalCount);
        const button = document.createElement('button');
        button.textContent = `Pytania ${start}-${end}`;
        button.dataset.start = start;
        button.dataset.end = end;
        container.appendChild(button);
    }
};

// Funkcja obsługująca start quizu z wybranego zakresu
const handleRangeSelection = (event) => {
    const button = event.target.closest('button');
    if (!button || !button.dataset.start) return;

    const start = parseInt(button.dataset.start);
    const end = parseInt(button.dataset.end);

    quizManager.resetQuiz(); 
    quizManager.startQuiz('trening', start, end);
    
    // Przełączenie widoku na quiz
    document.getElementById('trening-menu').style.display = 'none';
    uiManager.showQuiz();
    
    uiManager.goToNext(quizManager); // Wyświetlenie pierwszego pytania
};

const initTreningMode = async () => {
    // 1. Ładowanie danych
    const success = await quizManager.loadQuestions();
    
    if (!success || quizManager.getTotalQuestionCount() === 0) {
        console.error("Aplikacja nie może wystartować - błąd ładowania lub brak pytań.");
        return; 
    }

    // 2. Ustawienie listenerów na przyciski quizu (odpowiedzi)
    uiManager.setupEventListeners(quizManager);
    
    // 3. Generowanie i obsługa menu treningowego
    generateRangeButtons();
    document.getElementById('range-buttons-container').addEventListener('click', handleRangeSelection);
    
    // 4. Obsługa przycisku "Powrót do Menu Głównego" (w menu wyboru zakresu)
    document.getElementById('back-to-main-menu').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // 5. OBSŁUGA PRZYCISKÓW W TRAKCIE QUIZU (NOWA LOGIKA)
    const backToRangeBtn = document.getElementById('back-to-range-selection');
    const goToMainMenuBtn = document.getElementById('go-to-main-menu-from-quiz');

    if (backToRangeBtn) {
        backToRangeBtn.addEventListener('click', () => {
            // Logika: ukryj quiz, pokaż menu wyboru zakresu
            uiManager._hideAllViews(); 
            document.getElementById('trening-menu').style.display = 'block';
            quizManager.resetQuiz(); 
        });
    }

    if (goToMainMenuBtn) {
        goToMainMenuBtn.addEventListener('click', () => {
            // Logika: powrót do index.html
            window.location.href = 'index.html';
        });
    }

    // Upewnienie się, że widoczne jest menu treningowe na starcie
    document.getElementById('trening-menu').style.display = 'block';
};

document.addEventListener('DOMContentLoaded', initTreningMode);