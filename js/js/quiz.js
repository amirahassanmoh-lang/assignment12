export default class Quiz {
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }
  buildApiUrl() {
    const params = new URLSearchParams({
      amount: this.numberOfQuestions,
      difficulty: this.difficulty,
    });
    if (this.category) {
      params.append("category", this.category);
    }
    return `https://opentdb.com/api.php?${params}`;
  }
  async getQuestions() {
    try {
      const url = this.buildApiUrl();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      if (data.response_code !== 0) {
        throw new Error("No questions found");
      }
      this.questions = data.results;
      return this.questions;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }
  nextQuestion() {
    this.currentQuestionIndex++;
    return this.currentQuestionIndex < this.questions.length;
  }
  incrementScore() {
    this.score++;
  }
  getScorePercentage() {
  return Math.round(
    (this.score / this.numberOfQuestions) * 100
  );
}
isComplete() {
  return this.currentQuestionIndex >= this.questions.length;
}
endQuiz() {
  const percentage = this.getScorePercentage();
  return `
    <div class="game-card results-card">
      <h2 class="results-title">Quiz Complete!</h2>

      <p class="results-score-display">
        ${this.score}/${this.numberOfQuestions}
      </p>
      <p class="results-percentage">
        ${percentage}% Accuracy
      </p>
      <div class="action-buttons">
        <button class="btn-restart" onclick="location.reload()">
          Play Again
        </button>
      </div>
    </div>
  `;
}
}
