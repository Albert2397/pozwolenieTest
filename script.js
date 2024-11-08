document.addEventListener("DOMContentLoaded", () => {
  // Dodanie nasłuchiwaczy do przycisków w menu
  document.getElementById("all-questions").addEventListener("click", () => startQuiz('all'));
  document.getElementById("questions-1-10").addEventListener("click", () => startQuiz('1-10'));
  document.getElementById("questions-11-20").addEventListener("click", () => startQuiz('11-20'));
  document.getElementById("questions-21-30").addEventListener("click", () => startQuiz('21-30'));
  document.getElementById("questions-31-40").addEventListener("click", () => startQuiz('31-40'));
  document.getElementById("questions-41-50").addEventListener("click", () => startQuiz('41-50'));
  document.getElementById("questions-51-60").addEventListener("click", () => startQuiz('51-60'));
  document.getElementById("questions-61-70").addEventListener("click", () => startQuiz('61-70'));
  document.getElementById("questions-71-80").addEventListener("click", () => startQuiz('71-80'));
  document.getElementById("questions-81-90").addEventListener("click", () => startQuiz('81-90'));
  document.getElementById("questions-91-100").addEventListener("click", () => startQuiz('91-100'));
  document.getElementById("questions-101-110").addEventListener("click", () => startQuiz('101-110'));
  document.getElementById("questions-111-120").addEventListener("click", () => startQuiz('111-120'));
  document.getElementById("questions-121-130").addEventListener("click", () => startQuiz('121-130'));
  document.getElementById("questions-131-140").addEventListener("click", () => startQuiz('131-140'));
  document.getElementById("questions-141-150").addEventListener("click", () => startQuiz('141-150'));
  document.getElementById("questions-151-160").addEventListener("click", () => startQuiz('151-160'));
  document.getElementById("questions-161-170").addEventListener("click", () => startQuiz('161-170'));
  document.getElementById("questions-171-180").addEventListener("click", () => startQuiz('171-180'));
  document.getElementById("questions-181-190").addEventListener("click", () => startQuiz('181-190'));
  document.getElementById("questions-191-200").addEventListener("click", () => startQuiz('191-200'));
  document.getElementById("random-20").addEventListener("click", () => startQuiz('random-20'));

  // Dodanie nasłuchiwaczy do przycisków w quizie
  document.getElementById("next-button").addEventListener("click", nextQuestion);
  document.getElementById("showResult").addEventListener("click", showResult);
  document.getElementById("returnToMenu").addEventListener("click", returnToMenu);
});

let questions = [];
let filteredQuestions = [];
let selectedRange = "";
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswers = [];
let timerInterval;

fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
      questions = data.questions;
      document.getElementById("menu").style.display = "block";
  })
  .catch((error) => {
      alert("Błąd podczas ładowania pytań: " + error);
  });

function startQuiz(option) {
  selectedRange = option === "random-20" ? "Egzamin Próbny" : option;
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  if (questions.length === 0) {
      alert("Pytania nie zostały jeszcze załadowane. Spróbuj ponownie za chwilę.");
      return;
  }

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  const ranges = {
      all: [0, questions.length],
      "1-10": [0, 10],
      "11-20": [10, 20],
      "21-30": [20, 30],
      "31-40": [30, 40],
      "41-50": [40, 50],
      "51-60": [50, 60],
      "61-70": [60, 70],
      "71-80": [70, 80],
      "81-90": [80, 90],
      "91-100": [90, 100],
      "101-110": [100, 110],
      "111-120": [110, 120],
      "121-130": [120, 130],
      "131-140": [130, 140],
      "141-150": [140, 150],
      "151-160": [150, 160],
      "161-170": [160, 170],
      "171-180": [170, 180],
      "181-190": [180, 190],
      "191-200": [190, 200],
      "random-20": "random-20",
  };

  if (option === "random-20") {
      // Losowe pytania
      filteredQuestions = questions.slice().sort(() => 0.5 - Math.random()).slice(0, 20);
      // Rozpoczęcie odliczania (30 minut)
      startCountdown(30);
  } else {
      // Zakres pytań w zależności od wybranej opcji
      const [start, end] = ranges[option];
      filteredQuestions = questions.slice(start, end);
  }

  // Resetuj indeks pytania, wynik, i wybrane odpowiedzi
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers = [];

  // Jeśli są pytania, pokaż pierwsze
  if (filteredQuestions.length > 0) {
      showQuestion();
  } else {
      alert("Brak pytań do wyświetlenia.");
      document.getElementById("menu").style.display = "block";
      document.getElementById("quiz").style.display = "none";
  }
}

function startCountdown(minutes) {
  // Wartość początkowa czasu w sekundach
  let time = minutes * 60;

  // Stworzenie lub wyczyszczenie istniejącego timera, jeśli istnieje
  if (timerInterval) {
      clearInterval(timerInterval);
  }

  const countdownElement = document.getElementById("countdown-timer");
  countdownElement.innerHTML = ""; // Wyczyszczenie wcześniejszej zawartości

  // Aktualizowanie zawartości elementu countdown-timer
  timerInterval = setInterval(() => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;

      countdownElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      if (time <= 0) {
          clearInterval(timerInterval);
          alert("Czas minął!");
          showResult();
      } else {
          time--;
      }
  }, 1000);
}

function showQuestion() {
  if (currentQuestionIndex < filteredQuestions.length) {
      const question = filteredQuestions[currentQuestionIndex];
      const questionContainer = document.getElementById("question-container");
      questionContainer.innerHTML = `
          <h1>${headerText()}</h1>
          <h2>Pytanie ${currentQuestionIndex + 1}/${filteredQuestions.length}: ${question.question}</h2>
          <div>
              ${question.answers
                  .map((answer, index) => `
                      <label>
                          <input type="radio" name="answer" value="${index}">
                          ${answer.label}. ${answer.text}
                      </label><br>
                  `)
                  .join("")}
          </div>
      `;
  } else {
      showResult();
  }
}

function nextQuestion() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  if (selectedOption) {
      const selectedAnswerIndex = parseInt(selectedOption.value);
      const correctAnswerIndex = filteredQuestions[currentQuestionIndex].answers.findIndex((answer) => answer.is_correct);

      selectedAnswers.push({
          question: filteredQuestions[currentQuestionIndex].question,
          selectedAnswer: selectedAnswerIndex,
          correctAnswer: correctAnswerIndex,
      });

      if (selectedAnswerIndex === correctAnswerIndex) {
          score++;
      }

      currentQuestionIndex++;
      showQuestion();
  } else {
      alert("Wybierz odpowiedź, zanim przejdziesz do kolejnego pytania.");
  }
}

function showResult() {
  document.getElementById("quiz").style.display = "none";
  const resultContainer = document.getElementById("result");
  resultContainer.style.display = "block";
  
  // Ukrycie elementu odliczania po zakończeniu quizu
  const countdownElement = document.getElementById("countdown-timer");
  countdownElement.style.display = "none";

  resultContainer.innerHTML = `
      <h1>${headerText()}</h1>
      <h2>Twój wynik: ${score}/${filteredQuestions.length}</h2>
      ${
          score / filteredQuestions.length >= 0.9
              ? '<p style="font-weight: bold; font-size: 1.5em; color: green;">Zdane!</p>'
              : '<p style="font-weight: bold; font-size: 1.5em; color: red;">Niezdane!</p>'
      }
      <h3>Raport:</h3><ul>
      ${selectedAnswers
          .map((item, index) => `
              <li>
              <p>Pytanie ${index + 1}: ${item.question}</p>
              <p>Twoja odpowiedź: <span style="color: ${item.selectedAnswer === item.correctAnswer ? "green" : "red"};">
              ${filteredQuestions[index].answers[item.selectedAnswer].label}. ${filteredQuestions[index].answers[item.selectedAnswer].text}</span></p>
              ${item.selectedAnswer !== item.correctAnswer
                  ? `<p>Prawidłowa odpowiedź to: <span style="color: green;">${filteredQuestions[index].answers[item.correctAnswer].label}. ${filteredQuestions[index].answers[item.correctAnswer].text}</span></p>`
                  : ""}
              </li>
          `)
          .join("")}
      </ul>
      <button onclick="returnToMenu()">Powrót do menu głównego</button>
      `;
}

function returnToMenu() {
  document.getElementById("menu").style.display = "block";
  document.getElementById("quiz").style.display = "none";
  document.getElementById("result").style.display = "none";

  // Resetuj inne zmienne lub stan quizu, jeśli jest to konieczne
  filteredQuestions = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers = [];

  // Zatrzymanie timera, jeśli trwa
  if (timerInterval) {
      clearInterval(timerInterval);
  }
      // Ukrycie elementu odliczania
      const countdownElement = document.getElementById("countdown-timer");
      countdownElement.style.display = "none";
}

function headerText() {
  if (selectedRange === "Egzamin Próbny") {
      return "Egzamin Próbny";
  } else if (selectedRange === "all") {
      return "Wszystkie pytania";
  } else {
      return `Pytania ${selectedRange}`;
  }
}
