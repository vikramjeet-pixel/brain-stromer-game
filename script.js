const categoryContainer = document.getElementById('category-container');
const categoriesEl = document.getElementById('categories');
const quizContainer = document.querySelector('.quiz-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const nextBtn = document.getElementById('next-btn');
const progressEl = document.getElementById('progress');
const resultContainer = document.getElementById('result');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 10; // Number of questions per session (adjustable)

// Fetch categories from Open Trivia DB
async function loadCategories() {
    const response = await fetch('https://opentdb.com/api_category.php');
    const data = await response.json();
    data.trivia_categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.classList.add('category-btn');
        btn.addEventListener('click', () => startQuiz(category.id));
        categoriesEl.appendChild(btn);
    });
}

// Start quiz with selected category
async function startQuiz(categoryId) {
    categoryContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    await fetchQuestions(categoryId);
    loadQuestion();
}

// Fetch questions from API
async function fetchQuestions(categoryId) {
    const response = await fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryId}&type=multiple`);
    const data = await response.json();
    questions = data.results.map(q => ({
        question: decodeHTML(q.question),
        options: [...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)].sort(() => Math.random() - 0.5),
        answer: decodeHTML(q.correct_answer)
    }));
}

// Decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    nextBtn.disabled = true;

    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.classList.add('option-btn');
        btn.addEventListener('click', () => checkAnswer(option, q.answer));
        optionsEl.appendChild(btn);
    });

    updateProgress();
}

function checkAnswer(selected, correct) {
    const buttons = optionsEl.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        }
        if (btn.textContent === selected && selected !== correct) {
            btn.classList.add('wrong');
        }
    });

    if (selected === correct) {
        score++;
        scoreEl.textContent = `Score: ${score}`;
        feedbackEl.textContent = "Correct! 🎉";
        feedbackEl.style.color = "#4ecdc4";
    } else {
        feedbackEl.textContent = "Wrong! 😕";
        feedbackEl.style.color = "#ff6b6b";
    }

    nextBtn.disabled = false;
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressEl.style.setProperty('--progress-width', `${progress}%`);
    progressEl.innerHTML = `<style>.progress-bar::after { width: ${progress}%; }</style>`;
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        loadQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    finalScoreEl.textContent = `You scored ${score} out of ${totalQuestions}!`;
}

restartBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    scoreEl.textContent = `Score: ${score}`;
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    categoryContainer.style.display = 'block';
});

// Initialize the game
loadCategories();