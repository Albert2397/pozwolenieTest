/**
 * Klasa reprezentująca pojedyncze pytanie (obsługuje format JSON z tablicą odpowiedzi).
 */
class Question {
    // Akceptuje pola: number, question, answers
    constructor({ number, question, answers }) { 
        this.id = number;
        this.text = question;
        this.rawAnswers = answers; 
        this.correctKey = this._findCorrectKey(); 
    }
    
    /**
     * Wyszukuje i zwraca klucz (label) poprawnej odpowiedzi.
     * @returns {string|null} Klucz odpowiedzi (np. 'A', 'B') lub null.
     */
    _findCorrectKey() {
        // Znajduje obiekt odpowiedzi, gdzie is_correct jest true
        const correct = this.rawAnswers.find(answer => answer.is_correct);
        // Zwracamy klucz (np. 'a', 'b') zamieniony na wielką literę ('A', 'B')
        return correct ? correct.label.toUpperCase() : null; 
    }

    /**
     * Sprawdza, czy podany klucz jest poprawny.
     */
    checkAnswer(selectedKey) {
        if (!selectedKey) return false;
        return selectedKey.toUpperCase() === this.correctKey;
    }

    /**
     * Zwraca całą tablicę obiektów odpowiedzi.
     */
    getAnswers() {
        return this.rawAnswers;
    }
}

export default Question;