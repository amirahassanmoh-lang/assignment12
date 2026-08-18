'use strict'
import Quiz from "./quiz.js";
import Question from "./question.js";
const quizOptionsForm = document.getElementById("quizOptions");
const playerNameInput = document.getElementById("playerName");
const categoryInput = document.getElementById("categoryMenu");
const difficultyInput = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");
const startQuizBtn = document.getElementById("startQuiz");
const questionsContainer = document.querySelector(".questions-container");
let currentQuiz = null;

function validateForm(){
    const num = Number(questionsNumber.value)
    if (!questionsNumber.value) {
        return {
        isValid: false,
        error: "Please enter number of questions",
    };
    } else if (num < 1) {
        return {
            isValid: false,
            error: "Minimum 1 question required",
        };
    } else if (num > 50) {
        return {
            isValid: false,
            error: "Maximum 50 questions allowed",
        };
    }else{return {
        isValid: true,
        error: null,
    };}
} 
function showFormError(message) {
    const oldError = document.querySelector(".form-error");
    if (oldError) {
    oldError.remove();
    }
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("form-error");
    errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message};`;
    startQuizBtn.before(errorDiv);
    setTimeout(() => {
    errorDiv.remove();
    }, 3000);
}
function showLoading() {
    questionsContainer.innerHTML = `
    <div class="loading-overlay">
    <div class="loading-spinner"></div>
    <p class="loading-text">Loading Questions...</p>
    </div>
    `;

}
function hideLoading(){
    questionsContainer.innerHTML=""
}
startQuizBtn.addEventListener("click", () => {
    startQuiz()
});
async function startQuiz() {
    const validation = validateForm();
    if (!validation.isValid) {
    showFormError(validation.error);
    return;
    }
    startQuizBtn.disabled = true;
    showLoading();
    const playerName = playerNameInput.value || "Player";
    const category = categoryInput.value;
    const difficulty = difficultyInput.value;
    const amount = questionsNumber.value;
    try {
    currentQuiz = new Quiz(category, difficulty, amount, playerName);
    await currentQuiz.getQuestions();
    console.log("QUESTIONS:", currentQuiz.questions);
    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
        throw new Error("No questions loaded");
    }
    hideLoading();
    quizOptionsForm.classList.add("hidden");
    const question = new Question(currentQuiz, questionsContainer, () => {});
    question.displayQuestion();
    } catch (error) {
    console.log(error);
    hideLoading();
    startQuizBtn.disabled = false;
    }
}


