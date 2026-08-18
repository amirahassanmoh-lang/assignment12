
export default class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;
    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;
    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.wrongAnswers = this.questionData.incorrect_answers.map((a) =>
      this.decodeHtml(a),
    );
    this.allAnswers = this.shuffleAnswers();
    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15;
  }
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }
  shuffleAnswers() {
    const all = [...this.wrongAnswers, this.correctAnswer];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }
  displayQuestion() {
    const progress = this.getProgress();
    const html = `
    <div class="game-card question-card">
      <div class="xp-bar-container">
        <div class="xp-bar-header">
          <span class="xp-label">
            <i class="fa-solid fa-bolt"></i> Progress
          </span>
          <span class="xp-value">
            Question ${this.index + 1}/${this.quiz.numberOfQuestions}
          </span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-badge category">
          <i class="fa-solid fa-bookmark"></i>
          <span>${this.category}</span>
        </div>
        <div class="stat-badge difficulty ${this.quiz.difficulty}">
          <i class="fa-solid fa-face-smile"></i>
          <span>${this.quiz.difficulty}</span>
        </div>
        <div class="stat-badge timer">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="timer-value">${this.timeRemaining}</span>s
        </div>
        <div class="stat-badge counter">
          <i class="fa-solid fa-gamepad"></i>
          <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
        </div>
      </div>
      <!-- Question -->
      <h2 class="question-text">
        ${this.question}
      </h2>
      <!-- Answers -->
      <div class="answers-grid">
        ${this.allAnswers
          .map(
            (answer, i) => `
          <button class="answer-btn" data-answer="${answer}">
            <span class="answer-key">${i + 1}</span>
            <span class="answer-text">${answer}</span>
          </button>
        `,
          )
          .join("")}
      </div>
      <!-- Keyboard hint -->
      <p class="keyboard-hint">
        <i class="fa-regular fa-keyboard"></i>
        Press 1-4 to select
      </p>
      <!-- Score -->
      <div class="score-panel">
        <div class="score-item">
          <div class="score-item-label">Score</div>
          <div class="score-item-value">${this.quiz.score}</div>
        </div>
      </div>
    </div>
  `;
    this.container.innerHTML = html;
    this.addEventListeners();
    this.startTimer();
  }
  addEventListeners() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        this.checkAnswer(button);
      });
    });
    this.keyHandler = (e) => {
      const key = e.key;
      if (["1", "2", "3", "4"].includes(key)) {
        const index = parseInt(key) - 1;
        const selectedButton = buttons[index];
        if (selectedButton) {
          this.checkAnswer(selectedButton);
        }
      }
    };
    document.addEventListener("keydown", this.keyHandler);
  }
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }
  checkAnswer(choiceElement) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();
    const selectedAnswer = choiceElement.dataset.answer;
    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();
    const buttons = this.container.querySelectorAll(".answer-btn");
    if (isCorrect) {
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
    } else {
      choiceElement.classList.add("wrong");
      buttons.forEach((btn) => {
        if (btn.dataset.answer === this.correctAnswer) {
          btn.classList.add("correct-reveal");
        }
      });
    }
    buttons.forEach((btn) => btn.classList.add("disabled"));
    this.animateQuestion(1500);
  }
  startTimer() {
    const timerElement = this.container.querySelector(".timer-value");
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      timerElement.textContent = this.timeRemaining;

      const timerBadge = this.container.querySelector(".timer");
      if (this.timeRemaining <= 5) {
        timerBadge.classList.add("warning");
      }
      if (this.timeRemaining <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }
  stopTimer() {
    clearInterval(this.timerInterval);
  }
  handleTimeUp() {
    this.answered = true;
    this.stopTimer();
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      btn.classList.add("disabled");
      if (btn.dataset.answer === this.correctAnswer) {
        btn.classList.add("correct-reveal");
      }
    });
    this.animateQuestion(1500);
  }
  animateQuestion(duration = 1500) {
    setTimeout(() => {
      this.container.querySelector(".question-card")?.classList.add("exit");
      setTimeout(() => {
        this.getNextQuestion();
      }, 300);
    }, duration);
  }
  getNextQuestion() {
    const hasNext = this.quiz.nextQuestion();
    if (hasNext) {
      const question = new Question(this.quiz, this.container, this.onQuizEnd);
      question.displayQuestion();
    } else {
      this.container.innerHTML = this.quiz.endQuiz();
    }
  }
