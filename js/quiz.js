// =====================================================
// HISTORY 12 - QUIZ MODULE
// Module: QUIZ
// [QZ-001] Assessment engine and exam generation
// Purpose: Generate exams from blueprint, handle answers, and calculate scores
// =====================================================

import { loadJSON } from './app.js';
import { saveQuizResult, getBestScore } from './storage.js';

let quizData = { questions: [], blueprints: [] };
let currentExam = null;
let userAnswers = {};
let examTimer = null;
let timeLeft = 0;

/**
 * [QZ-002] Initialize quiz module
 */
export async function initializeQuiz() {
  try {
    const [questionsRes, blueprintsRes] = await Promise.all([
      loadJSON('./data/questions.json'),
      loadJSON('./data/exam-blueprints.json')
    ]);

    if (!questionsRes?.questions || !blueprintsRes?.examTypes) {
      throw new Error('Invalid quiz data structure');
    }

    // Filter only approved questions
    quizData.questions = questionsRes.questions.filter(q => q.publicationStatus === 'approved');
    quizData.blueprints = blueprintsRes.examTypes.filter(b => b.publicationStatus === 'approved');

    renderQuizSelection();
    setupQuizListeners();

  } catch (error) {
    console.error('Quiz init failed:', error);
    displayQuizError('Không thể tải dữ liệu bài kiểm tra.');
  }
}

/**
 * [QZ-003] Render quiz selection screen
 */
function renderQuizSelection() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  if (quizData.blueprints.length === 0) {
    container.innerHTML = '<div class="timeline-empty">Chưa có bài kiểm tra nào được phê duyệt.</div>';
    return;
  }

  let html = '<div class="exam-list">';
  quizData.blueprints.forEach(exam => {
    const totalQs = exam.blueprint.reduce((sum, section) => sum + section.questionCount, 0);
    const bestScore = getBestScore(exam.id);
    
    html += `
      <div class="exam-card" data-exam-id="${exam.id}">
        <h3>${exam.name}</h3>
        <p>${exam.description}</p>
        <div class="exam-meta">
          <span>⏱ ${exam.duration} phút</span>
          <span>📝 ${totalQs} câu hỏi</span>
          ${bestScore !== null ? `<span class="best-score">Điểm cao nhất: ${bestScore}%</span>` : ''}
        </div>
        <button class="start-exam-btn" data-exam-id="${exam.id}">Bắt đầu làm bài</button>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

/**
 * [QZ-004] Generate exam based on blueprint
 */
function generateExam(examId) {
  const blueprint = quizData.blueprints.find(b => b.id === examId);
  if (!blueprint) return null;

  const examQuestions = [];
  const usedQuestionIds = new Set();

  for (const section of blueprint.blueprint) {
    // Filter eligible questions
    let eligible = quizData.questions.filter(q => {
      const matchTopic = section.topic === 'all' || q.topic === section.topic;
      const matchPeriod = section.period === 'all' || q.period === section.period;
      const matchDiff = section.difficulty === 'mixed' || q.difficulty === section.difficulty;
      const matchType = section.types.includes(q.type);
      return matchTopic && matchPeriod && matchDiff && matchType;
    });

    // Remove already used questions
    eligible = eligible.filter(q => !usedQuestionIds.has(q.id));

    // Shuffle and pick required amount
    if (blueprint.shuffleQuestions) {
      eligible = shuffleArray(eligible);
    }

    const selected = eligible.slice(0, section.questionCount);
    selected.forEach(q => {
      usedQuestionIds.add(q.id);
      examQuestions.push(q);
    });
  }

  if (examQuestions.length === 0) {
    return { error: 'Không đủ câu hỏi phù hợp với đề cương này.' };
  }

  return {
    ...blueprint,
    questions: examQuestions,
    totalGradable: examQuestions.filter(q => q.type !== 'essay-outline').length
  };
}

/**
 * [QZ-005] Render active exam
 */
function renderActiveExam(exam) {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  currentExam = exam;
  userAnswers = {};
  timeLeft = exam.duration * 60;

  let html = `
    <div class="exam-header">
      <h3>${exam.name}</h3>
      <div class="timer" id="quiz-timer">⏱ ${formatTime(timeLeft)}</div>
      <button class="submit-exam-btn">Nộp bài</button>
    </div>
    <div class="exam-questions">
  `;

  exam.questions.forEach((q, index) => {
    html += `<div class="question-block" data-q-id="${q.id}">`;
    html += `<p class="q-text"><strong>Câu ${index + 1}:</strong> ${q.question}</p>`;

    if (q.type === 'multiple-choice') {
      q.options.forEach(opt => {
        html += `
          <label class="option-label">
            <input type="radio" name="q-${q.id}" value="${opt.id}">
            ${opt.id}. ${opt.text}
          </label>
        `;
      });
    } else if (q.type === 'true-false') {
      html += `
        <label class="option-label"><input type="radio" name="q-${q.id}" value="true"> Đúng</label>
        <label class="option-label"><input type="radio" name="q-${q.id}" value="false"> Sai</label>
      `;
    } else if (q.type === 'true-false-multi') {
      q.statements.forEach(stmt => {
        html += `
          <div class="tf-multi-item">
            <span>${stmt.id}) ${stmt.text}</span>
            <label><input type="radio" name="q-${q.id}-${stmt.id}" value="true"> Đúng</label>
            <label><input type="radio" name="q-${q.id}-${stmt.id}" value="false"> Sai</label>
          </div>
        `;
      });
    } else if (q.type === 'essay-outline') {
      html += `<textarea class="essay-input" data-q-id="${q.id}" placeholder="Nhập dàn ý hoặc suy nghĩ của bạn ở đây..."></textarea>`;
      html += `<p class="essay-note">⚠️ ${q.gradingNote || 'Phần này không được chấm điểm tự động.'}</p>`;
    }

    html += `</div>`;
  });

  html += `</div>`;
  container.innerHTML = html;

  startTimer();
}

/**
 * [QZ-006] Collect answers and calculate score
 */
function submitExam() {
  if (!currentExam) return;
  
  clearInterval(examTimer);
  
  // Collect answers from DOM
  currentExam.questions.forEach(q => {
    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      const selected = document.querySelector(`input[name="q-${q.id}"]:checked`);
      if (selected) userAnswers[q.id] = selected.value;
    } else if (q.type === 'true-false-multi') {
      userAnswers[q.id] = {};
      q.statements.forEach(stmt => {
        const selected = document.querySelector(`input[name="q-${q.id}-${stmt.id}"]:checked`);
        if (selected) userAnswers[q.id][stmt.id] = selected.value === 'true';
      });
    } else if (q.type === 'essay-outline') {
      const textarea = document.querySelector(`textarea[data-q-id="${q.id}"]`);
      if (textarea) userAnswers[q.id] = textarea.value;
    }
  });

  // Calculate score (ONLY for gradable questions)
  let correctCount = 0;
  let totalGradable = 0;

  currentExam.questions.forEach(q => {
    if (q.type === 'essay-outline') return; // Skip auto-grading for essay
    
    totalGradable++;
    if (q.type === 'true-false-multi') {
      let stmtCorrect = 0;
      q.statements.forEach(stmt => {
        if (userAnswers[q.id]?.[stmt.id] === stmt.correctAnswer) {
          stmtCorrect++;
        }
      });
      if (stmtCorrect === q.statements.length) correctCount++; // All must be correct for 1 point
    } else {
      if (userAnswers[q.id] == q.correctAnswer) { // == for string/boolean comparison
        correctCount++;
      }
    }
  });

  const score = totalGradable > 0 ? Math.round((correctCount / totalGradable) * 100) : 0;

  // Save to storage
  saveQuizResult(currentExam.id, { score, correctCount, totalGradable });

  renderExamResults(score, correctCount, totalGradable);
}

/**
 * [QZ-007] Render exam results
 */
function renderExamResults(score, correct, total) {
  const container = document.getElementById('quiz-container');
  
  let html = `
    <div class="exam-results">
      <h3>Kết quả bài làm</h3>
      <div class="score-display">
        <div class="score-circle">${score}%</div>
        <p>Đúng ${correct}/${total} câu hỏi chấm điểm</p>
      </div>
  `;

  // Show explanations and essay outlines
  currentExam.questions.forEach(q => {
    html += `<div class="result-question">`;
    html += `<p><strong>Câu hỏi:</strong> ${q.question}</p>`;
    
    if (q.type !== 'essay-outline') {
      const isCorrect = q.type === 'true-false-multi' 
        ? q.statements.every(stmt => userAnswers[q.id]?.[stmt.id] === stmt.correctAnswer)
        : userAnswers[q.id] == q.correctAnswer;
        
      html += `<p class="result-status ${isCorrect ? 'correct' : 'incorrect'}">
        ${isCorrect ? '✅ Đúng' : '❌ Sai'}
      </p>`;
      if (currentExam.showExplanation) {
        html += `<p class="explanation">💡 Giải thích: ${q.explanation}</p>`;
      }
    } else {
      html += `<p class="essay-note">📝 Dàn ý tham khảo:</p>`;
      html += `<ul class="basic-points-list">`;
      q.sampleOutline.mainPoints.forEach(pt => html += `<li>${pt}</li>`);
      html += `</ul>`;
    }
    
    // Timeline reference link
    if (q.timelineRef && q.timelineRef.length > 0) {
      html += `<p class="timeline-ref">🔗 Xem lại sự kiện: <a href="#timeline" class="nav-link-ref" data-ref="${q.timelineRef[0]}">${q.timelineRef[0]}</a></p>`;
    }
    
    html += `</div>`;
  });

  html += `<button class="back-to-list-btn">Quay lại danh sách bài kiểm tra</button></div>`;
  container.innerHTML = html;
}

// --- Helper Functions ---

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startTimer() {
  clearInterval(examTimer);
  examTimer = setInterval(() => {
    timeLeft--;
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) timerEl.textContent = `⏱ ${formatTime(timeLeft)}`;
    
    if (timeLeft <= 0) {
      clearInterval(examTimer);
      alert('Hết giờ làm bài!');
      submitExam();
    }
  }, 1000);
}

function setupQuizListeners() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('start-exam-btn')) {
      const examId = e.target.dataset.examId;
      const exam = generateExam(examId);
      if (exam?.error) {
        alert(exam.error);
      } else {
        renderActiveExam(exam);
      }
    }
    
    if (e.target.classList.contains('submit-exam-btn')) {
      if (confirm('Bạn có chắc chắn muốn nộp bài?')) {
        submitExam();
      }
    }

    if (e.target.classList.contains('back-to-list-btn')) {
      currentExam = null;
      renderQuizSelection();
    }

    // Handle timeline ref click in results
    if (e.target.classList.contains('nav-link-ref')) {
      e.preventDefault();
      const refId = e.target.dataset.ref;
      // Trigger timeline to open this event (requires global access or event dispatch)
      window.dispatchEvent(new CustomEvent('openTimelineEvent', { detail: refId }));
    }
  });
}

function displayQuizError(msg) {
  const container = document.getElementById('quiz-container');
  if (container) container.innerHTML = `<div class="timeline-error">${msg}</div>`;
}
