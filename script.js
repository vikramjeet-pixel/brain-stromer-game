const categoryContainer = document.getElementById('category-container');
const categoriesEl = document.getElementById('categories');
const difficultyEl = document.getElementById('difficulty');
const loadSavedBtn = document.getElementById('load-saved-btn');
const quizContainer = document.querySelector('.quiz-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const nextBtn = document.getElementById('next-btn');
const hintBtn = document.getElementById('hint-btn');
const fiftyBtn = document.getElementById('fifty-btn');
const aiBtn = document.getElementById('ai-btn');
const voiceToggleBtn = document.getElementById('voice-toggle-btn');
const saveBtn = document.getElementById('save-btn');
const timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const resultContainer = document.getElementById('result');
const finalScoreEl = document.getElementById('final-score');
const progressDetailsEl = document.getElementById('progress-details');
const shareBtn = document.getElementById('share-btn');
const restartBtn = document.getElementById('restart-btn');
const themeBtn = document.getElementById('theme-btn');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let totalQuestions = 10;
let hintUsed = false;
let fiftyUsed = false;
let aiUsed = false;
let timer;
let timeLeft = 30;
let progress = [];
let themes = ['light', 'dark', 'ai'];
let currentThemeIndex = 0;
let voiceOverEnabled = true;

// Updated sound effects (sci-fi themed from freesound.org)
const correctSound = new Audio('https://freesound.org/data/previews/171/171671_2435678-lq.mp3'); // Sci-fi ping
const wrongSound = new Audio('https://freesound.org/data/previews/331/331912_2193267-lq.mp3'); // Sci-fi error
const tickSound = new Audio('https://freesound.org/data/previews/269/269021_5094888-lq.mp3'); // Sci-fi tick

// Theme switching
themeBtn.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    document.body.setAttribute('data-theme', themes[currentThemeIndex]);
});

// Voice toggle
voiceToggleBtn.addEventListener('click', () => {
    voiceOverEnabled = !voiceOverEnabled;
    voiceToggleBtn.textContent = `Voice Over: ${voiceOverEnabled ? 'On' : 'Off'}`;
});

// Fetch categories
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

// Start quiz
async function startQuiz(categoryId) {
    categoryContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    await fetchQuestions(categoryId, difficultyEl.value);
    loadQuestion();
}

// Fetch questions
async function fetchQuestions(categoryId, difficulty) {
    const response = await fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryId}&difficulty=${difficulty}&type=multiple`);
    const data = await response.json();
    questions = data.results.map(q => ({
        question: decodeHTML(q.question),
        options: [...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)].sort(() => Math.random() - 0.5),
        answer: decodeHTML(q.correct_answer),
        hint: `Hint: Starts with "${decodeHTML(q.correct_answer)[0]}"`,
        aiHint: `AI suggests: Think about "${decodeHTML(q.correct_answer).split(' ')[0]}"`
    }));
}

// Decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function loadQuestion() {
    clearTimer();
    const q = questions[currentQuestionIndex];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    nextBtn.disabled = true;
    hintBtn.disabled = false;
    fiftyBtn.disabled = false;
    aiBtn.disabled = false;
    hintUsed = false;
    fiftyUsed = false;
    aiUsed = false;
    timeLeft = 30;
    timerEl.textContent = `Time: ${timeLeft}s`;
    startTimer();

    // Voice read-aloud if enabled
    if (voiceOverEnabled) {
        const utterance = new SpeechSynthesisUtterance(q.question);
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
    }

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
    clearTimer();
    const buttons = optionsEl.querySelectorAll('.option-btn');
    let isCorrect = selected === correct;
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        }
        if (btn.textContent === selected && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    if (isCorrect) {
        streak++;
        let multiplier = streak >= 3 ? 1.5 : 1;
        score += (hintUsed || aiUsed ? 0.5 : 1) * multiplier;
        scoreEl.textContent = `Score: ${score.toFixed(1)} | Streak: ${streak}`;
        feedbackEl.textContent = getAIFeedback(true);
        feedbackEl.style.color = document.body.getAttribute('data-theme') === 'ai' ? '#00ffcc' : '#4ecdc4';
        correctSound.play();
    } else {
        streak = 0;
        scoreEl.textContent = `Score: ${score.toFixed(1)} | Streak: ${streak}`;
        feedbackEl.textContent = getAIFeedback(false);
        feedbackEl.style.color = document.body.getAttribute('data-theme') === 'ai' ? '#ff3366' : '#ff6b6b';
        wrongSound.play();
    }

    progress.push({ question: questions[currentQuestionIndex].question, selected, correct, isCorrect });
    nextBtn.disabled = false;
    hintBtn.disabled = true;
    fiftyBtn.disabled = true;
    aiBtn.disabled = true;
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Time: ${timeLeft}s`;
        tickSound.play();
        if (timeLeft <= 0) {
            clearTimer();
            checkAnswer(null, questions[currentQuestionIndex].answer);
        }
    }, 1000);
}

function clearTimer() {
    clearInterval(timer);
}

hintBtn.addEventListener('click', () => {
    if (!hintUsed) {
        feedbackEl.textContent = questions[currentQuestionIndex].hint;
        hintUsed = true;
        hintBtn.disabled = true;
    }
});

fiftyBtn.addEventListener('click', () => {
    if (!fiftyUsed) {
        const q = questions[currentQuestionIndex];
        const buttons = optionsEl.querySelectorAll('.option-btn');
        let incorrectOptions = Array.from(buttons).filter(btn => btn.textContent !== q.answer);
        incorrectOptions.slice(0, 2).forEach(btn => btn.style.display = 'none');
        fiftyUsed = true;
        fiftyBtn.disabled = true;
    }
});

aiBtn.addEventListener('click', () => {
    if (!aiUsed) {
        feedbackEl.textContent = questions[currentQuestionIndex].aiHint;
        aiUsed = true;
        aiBtn.disabled = true;
    }
});

function getAIFeedback(isCorrect) {
    const correctResponses = [
        "Impressive, human! Your neural net is on fire.",
        "Correct! My circuits approve.",
        "Well done! You’re outsmarting my algorithms."
    ];
    const wrongResponses = [
        "Error 404: Correct answer not found.",
        "Even I knew that one, human!",
        "Incorrect. Reboot and try again?"
    ];
    return isCorrect ? correctResponses[Math.floor(Math.random() * correctResponses.length)] : wrongResponses[Math.floor(Math.random() * wrongResponses.length)];
}

function updateProgress() {
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressEl.style.setProperty('--progress-width', `${progressPercent}%`);
    progressEl.innerHTML = `<style>.progress-bar::after { width: ${progressPercent}%; }</style>`;
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        loadQuestion();
    } else {
        showResults();
    }
});

saveBtn.addEventListener('click', () => {
    const gameState = { questions, currentQuestionIndex, score, streak, progress, voiceOverEnabled };
    localStorage.setItem('quizState', JSON.stringify(gameState));
    resetToCategory();
});

loadSavedBtn.addEventListener('click', () => {
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
        questions = savedState.questions;
        currentQuestionIndex = savedState.currentQuestionIndex;
        score = savedState.score;
        streak = savedState.streak;
        progress = savedState.progress;
        voiceOverEnabled = savedState.voiceOverEnabled;
        voiceToggleBtn.textContent = `Voice Over: ${voiceOverEnabled ? 'On' : 'Off'}`;
        categoryContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        scoreEl.textContent = `Score: ${score.toFixed(1)} | Streak: ${streak}`;
        loadQuestion();
    }
});

function showResults() {
    clearTimer();
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    finalScoreEl.textContent = `You scored ${score.toFixed(1)} out of ${totalQuestions}!`;
    progressDetailsEl.innerHTML = progress.map((p, i) => 
        `<p>${i + 1}. ${p.question}<br>Selected: ${p.selected || 'None'} | Correct: ${p.correct} - ${p.isCorrect ? '✅' : '❌'}</p>`
    ).join('');
}

shareBtn.addEventListener('click', () => {
    const text = `I scored ${score.toFixed(1)}/${totalQuestions} on AI Quiz Master! Can you beat me?`;
    if (navigator.share) {
        navigator.share({ title: 'AI Quiz Master', text, url: window.location.href });
    } else {
        prompt('Copy this to share:', text);
    }
});

restartBtn.addEventListener('click', resetToCategory);

function resetToCategory() {
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    progress = [];
    scoreEl.textContent = `Score: ${score} | Streak: ${streak}`;
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    categoryContainer.style.display = 'block';
}

// Initialize
loadCategories();