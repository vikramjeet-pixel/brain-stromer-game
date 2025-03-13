# AI Quiz Master

An interactive trivia quiz application built with HTML, CSS, and JavaScript, featuring multiple categories, difficulty levels, lifelines (hints, 50/50, AI assistance), voice-over, and theme switching. Powered by the Open Trivia Database API.

## Project Overview

AI Quiz Master is a dynamic quiz game where users can test their knowledge across various categories and difficulties. It includes features like a timer, progress tracking, lifelines, sci-fi sound effects, and the ability to save/load progress. The game ends with a detailed results page and sharing options.

### Features
- **Categories & Difficulty**: Choose from multiple trivia categories and difficulty levels via the Open Trivia Database API.
- **Lifelines**: Use Hint, 50/50, and AI Hint once per question.
- **Timer**: 30 seconds per question with a sci-fi ticking sound.
- **Scoring**: Earn points with streak multipliers; reduced points when using lifelines.
- **Voice Over**: Optional text-to-speech for questions.
- **Themes**: Switch between light, dark, and AI-inspired themes.
- **Progress Tracking**: Visual progress bar and detailed results.
- **Save/Load**: Save your game state to local storage and resume later.
- **Share**: Share your score via the Web Share API or copy to clipboard.
- **Sound Effects**: Sci-fi themed sounds for correct/wrong answers and timer ticks.

## Technologies Used
- **HTML5**: Structure of the quiz interface.
- **CSS**: Styling for layout, themes, and progress bar (assumed in `styles.css`).
- **JavaScript**: Quiz logic, API integration, event handling, and audio.
- **Open Trivia Database API**: Source of quiz questions.
- **Web APIs**: SpeechSynthesis for voice-over, Web Share API for sharing.
- **External Resources**: Sci-fi sound effects from [Freesound](https://freesound.org).

## Getting Started

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- Internet connection (for fetching questions and sound effects).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-quiz-master.git
