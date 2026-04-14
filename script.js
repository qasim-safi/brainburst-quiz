/* ============================================================
   BrainBurst | script.js
   Fast-paced neon quiz with timer, scoring, and high scores.
   ============================================================ */

/* ── Question bank ────────────────────────────────────────── */
const QUESTIONS = {
  general: [
    { q:"What is the capital of Australia?",                   a:["Canberra","Sydney","Melbourne","Brisbane"],        c:0 },
    { q:"Which is the longest river in the world?",           a:["Nile","Amazon","Yangtze","Mississippi"],           c:0 },
    { q:"How many continents are there on Earth?",            a:["7","6","8","5"],                                   c:0 },
    { q:"What is the smallest planet in our solar system?",   a:["Mercury","Mars","Pluto","Venus"],                  c:0 },
    { q:"Who painted the Mona Lisa?",                         a:["Leonardo da Vinci","Michelangelo","Raphael","Caravaggio"], c:0 },
    { q:"What year did World War II end?",                    a:["1945","1944","1918","1939"],                       c:0 },
    { q:"What is the chemical symbol for gold?",              a:["Au","Ag","Go","Gd"],                               c:0 },
    { q:"How many sides does a hexagon have?",                a:["6","5","7","8"],                                   c:0 },
    { q:"What is the fastest land animal?",                   a:["Cheetah","Lion","Greyhound","Pronghorn"],          c:0 },
    { q:"Which country has the most natural lakes?",          a:["Canada","Russia","USA","Finland"],                 c:0 },
  ],
  tech: [
    { q:"What does CPU stand for?",                           a:["Central Processing Unit","Computer Power Unit","Core Processing Unit","Central Program Unit"], c:0 },
    { q:"Who co-founded Microsoft?",                          a:["Bill Gates","Steve Jobs","Mark Zuckerberg","Linus Torvalds"], c:0 },
    { q:"What language is used for web styling?",             a:["CSS","HTML","JavaScript","Python"],                c:0 },
    { q:"What does HTML stand for?",                          a:["HyperText Markup Language","High Transfer Markup Language","HyperText Markdown Language","High Text Markup Language"], c:0 },
    { q:"What does RAM stand for?",                           a:["Random Access Memory","Read-Only Access Memory","Run-Always Memory","Rapid Access Module"], c:0 },
    { q:"Which company makes the iPhone?",                    a:["Apple","Samsung","Google","Microsoft"],            c:0 },
    { q:"In what year was the first iPhone released?",        a:["2007","2005","2008","2010"],                       c:0 },
    { q:"What does API stand for?",                           a:["Application Programming Interface","Advanced Program Integration","Automated Process Interface","Application Protocol Index"], c:0 },
    { q:"What programming language is Flutter built with?",   a:["Dart","Swift","Kotlin","Java"],                   c:0 },
    { q:"What does 'git push' do?",                           a:["Uploads commits to remote","Downloads changes","Creates a branch","Merges branches"],  c:0 },
  ],
  science: [
    { q:"What is the most abundant gas in Earth's atmosphere?", a:["Nitrogen","Oxygen","Carbon Dioxide","Argon"],   c:0 },
    { q:"What is the approximate speed of light?",            a:["300,000 km/s","150,000 km/s","500,000 km/s","200,000 km/s"], c:0 },
    { q:"How many bones are in the adult human body?",        a:["206","186","212","198"],                          c:0 },
    { q:"What is the chemical formula for water?",            a:["H₂O","HO₂","H₂O₂","OH"],                        c:0 },
    { q:"Which planet is known as the Red Planet?",           a:["Mars","Jupiter","Saturn","Venus"],                c:0 },
    { q:"Who developed the theory of general relativity?",    a:["Albert Einstein","Isaac Newton","Nikola Tesla","Stephen Hawking"], c:0 },
    { q:"What is the powerhouse of the cell?",                a:["Mitochondria","Nucleus","Ribosome","Golgi body"], c:0 },
    { q:"What force causes objects to fall toward the Earth?",a:["Gravity","Magnetism","Friction","Inertia"],       c:0 },
    { q:"What is the boiling point of water at sea level (°C)?", a:["100°C","90°C","120°C","80°C"],                c:0 },
    { q:"What is the atomic number of Carbon?",               a:["6","8","12","4"],                                 c:0 },
  ],
};

/* ── State ─────────────────────────────────────────────────── */
let quizQuestions = [];
let currentQIdx   = 0;
let score         = 0;
let correctCount  = 0;
let timerInterval = null;
let timeLeft      = 30;
let answered      = false;
let currentCat    = '';
let lastCat       = '';
const TIMER_MAX   = 30;
const TIMER_CIRC  = 326.73; // 2π × 52

/* ── Screen switcher ─────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ── Quiz start ───────────────────────────────────────────── */
function startQuiz(cat) {
  currentCat = cat;
  lastCat = cat;

  if (cat === 'all') {
    quizQuestions = shuffle([
      ...QUESTIONS.general,
      ...QUESTIONS.tech,
      ...QUESTIONS.science,
    ]);
  } else {
    quizQuestions = shuffle([...QUESTIONS[cat]]);
  }

  // Shuffle answers for each question
  quizQuestions = quizQuestions.map(q => shuffleAnswers(q));

  currentQIdx  = 0;
  score        = 0;
  correctCount = 0;

  document.getElementById('catBadge').textContent = cat === 'all' ? 'All Topics' : cap(cat);
  document.getElementById('scoreVal').textContent = 0;

  showScreen('quizScreen');
  loadQuestion();
}

function retryQuiz() { startQuiz(lastCat); }
function quitQuiz()  { clearTimer(); showScreen('homeScreen'); renderHighScores(); }
function goHome()    { showScreen('homeScreen'); renderHighScores(); }

/* ── Question loader ─────────────────────────────────────── */
function loadQuestion() {
  if (currentQIdx >= quizQuestions.length) { endQuiz(); return; }

  answered = false;
  const q = quizQuestions[currentQIdx];

  // Header
  document.getElementById('qCounter').textContent =
    `Q ${currentQIdx + 1} / ${quizQuestions.length}`;

  // Progress bar
  document.getElementById('qProgressFill').style.width =
    `${(currentQIdx / quizQuestions.length) * 100}%`;

  // Question text (animate)
  const qCard = document.getElementById('questionCard');
  qCard.style.opacity = '0'; qCard.style.transform = 'translateY(10px)';
  document.getElementById('questionText').textContent = q.q;
  requestAnimationFrame(() => {
    qCard.style.transition = 'opacity .3s,transform .3s';
    qCard.style.opacity = '1'; qCard.style.transform = 'translateY(0)';
  });

  // Answer buttons
  const btns = document.querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.textContent = q.a[i];
    btn.className   = 'answer-btn';
    btn.disabled    = false;
  });

  // Timer
  startTimer();
}

/* ── Answer ───────────────────────────────────────────────── */
function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  clearTimer();

  const q    = quizQuestions[currentQIdx];
  const btns = document.querySelectorAll('.answer-btn');
  btns.forEach(b => b.disabled = true);

  if (idx === q.c) {
    btns[idx].classList.add('correct');
    const bonus = Math.round(timeLeft / TIMER_MAX * 500) + 500;
    score += bonus;
    correctCount++;
    document.getElementById('scoreVal').textContent = score;
  } else {
    btns[idx].classList.add('wrong');
    btns[q.c].classList.add('correct');
  }

  setTimeout(() => { currentQIdx++; loadQuestion(); }, 1200);
}

/* ── Timer ─────────────────────────────────────────────────── */
function startTimer() {
  clearTimer();
  timeLeft = TIMER_MAX;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) { clearTimer(); timeOut(); }
  }, 1000);
}

function clearTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerUI() {
  document.getElementById('timerNum').textContent = timeLeft;
  const offset = TIMER_CIRC - (TIMER_CIRC * timeLeft / TIMER_MAX);
  document.getElementById('timerCircle').style.strokeDashoffset = offset;
  const fill = document.getElementById('timerCircle');
  if (timeLeft <= 8)       { fill.classList.add('urgent');    fill.style.stroke = 'var(--red)'; }
  else if (timeLeft <= 15) { fill.classList.remove('urgent'); fill.style.stroke = 'var(--yellow)'; }
  else                     { fill.classList.remove('urgent'); fill.style.stroke = 'var(--cyan)'; }
}

function timeOut() {
  if (answered) return;
  answered = true;
  const q    = quizQuestions[currentQIdx];
  const btns = document.querySelectorAll('.answer-btn');
  btns.forEach(b => b.disabled = true);
  btns[q.c].classList.add('correct');
  setTimeout(() => { currentQIdx++; loadQuestion(); }, 1200);
}

/* ── End quiz ─────────────────────────────────────────────── */
function endQuiz() {
  clearTimer();

  const total    = quizQuestions.length;
  const accuracy = Math.round(correctCount / total * 100);

  document.getElementById('rsFinal').textContent   = score;
  document.getElementById('rsCorrect').textContent = `${correctCount}/${total}`;
  document.getElementById('rsAccuracy').textContent= `${accuracy}%`;

  // Trophy & title
  let trophy='🏅', title='Good Try!', sub='Keep practising to improve your score.';
  const badge = getBadge(accuracy);
  document.getElementById('resultBadge').textContent = badge;

  if (accuracy >= 90) { trophy='🏆'; title='Outstanding!'; sub='You nailed it! Incredible performance.'; }
  else if (accuracy >= 70) { trophy='🥇'; title='Great Job!'; sub='You really know your stuff!'; }
  else if (accuracy >= 50) { trophy='🥈'; title='Not Bad!'; sub='A bit more practice and you\'ll ace it.'; }
  else { trophy='🥉'; title='Keep Going!'; sub='Every expert started as a beginner.'; }

  document.getElementById('resultTrophy').textContent = trophy;
  document.getElementById('resultTitle').textContent  = title;
  document.getElementById('resultSub').textContent    = sub;

  // Save high score
  saveHighScore(currentCat, score);

  // Confetti if accuracy >= 70
  if (accuracy >= 70) runConfetti();

  // Progress bar to 100%
  document.getElementById('qProgressFill').style.width = '100%';

  showScreen('resultScreen');
}

function getBadge(acc) {
  if (acc >= 90) return '⭐ QUIZ MASTER';
  if (acc >= 70) return '🔥 BRAINIAC';
  if (acc >= 50) return '💡 CHALLENGER';
  return '📚 LEARNER';
}

/* ── High scores ─────────────────────────────────────────── */
const HS_KEY = 'brainburst_hs';

function saveHighScore(cat, s) {
  const hs = JSON.parse(localStorage.getItem(HS_KEY) || '{}');
  if (!hs[cat] || s > hs[cat]) hs[cat] = s;
  localStorage.setItem(HS_KEY, JSON.stringify(hs));
}

function renderHighScores() {
  const hs  = JSON.parse(localStorage.getItem(HS_KEY) || '{}');
  const el  = document.getElementById('hsList');
  const cats = ['general','tech','science','all'];
  const labels = { general:'🌍 General', tech:'💻 Technology', science:'🔬 Science', all:'⚡ All Topics' };

  const rows = cats.filter(c => hs[c]).map(c =>
    `<div class="hs-row"><span class="hs-cat">${labels[c]}</span><span class="hs-score">${hs[c]}</span></div>`
  );
  el.innerHTML = rows.length ? rows.join('') : '<p class="hs-empty">No scores yet — start playing!</p>';
}

/* ── Confetti ─────────────────────────────────────────────── */
function runConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#00f5ff','#bf00ff','#ff006e','#ffdd00','#00ff88','#ffffff'];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 10 + 6,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * 360,
    speed: Math.random() * 3 + 2,
    rot:   Math.random() * 6 - 3,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.w/2, p.y + p.h/2);
      ctx.rotate(p.angle * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.y += p.speed; p.x += Math.sin(p.angle * Math.PI/180) * 1.5;
      p.angle += p.rot;
    });
    frame++;
    if (frame < 200) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

/* ── Particles (background) ───────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    opacity: Math.random() * .5 + .1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 245, 255, ${p.opacity})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  });
}

/* ── Utilities ─────────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleAnswers(q) {
  const paired = q.a.map((ans, i) => ({ ans, isCorrect: i === q.c }));
  const shuffled = shuffle(paired);
  return {
    q: q.q,
    a: shuffled.map(p => p.ans),
    c: shuffled.findIndex(p => p.isCorrect),
  };
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Init ─────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initParticles();
  renderHighScores();
});
