// ==== Données de la routine ====
const routine = [
  {
    name: "Étirements 🤸🏻‍♂️",
    // 10min
    exercises: [
      { pic: "thoracic-rotation", duration: 30 },
      { pic: "hip-opener", duration: 30 },
      { pic: "standing-forward-fold", duration: 90 },
      { pic: "shoulder-opening", duration: 30 },
      { pic: "psoas-stretch", duration: 60 },
      { pic: "plow-pose", duration: 90 },
      { pic: "cobra-pose", duration: 90 },
      { pic: "calf-stretch", duration: 90 },
      { pic: "child-pose", duration: 90 },
    ],
  },
  {
    name: "Renforcement 💪",
    // 5min
    exercises: [
      { pic: "squat", duration: 45 },
      { pic: "pushup", duration: 45 },
      { pic: "rest", duration: 15 },
      { pic: "plank", duration: 45 },
      { pic: "rest", duration: 15 },
      { pic: "lunge", duration: 30 },
      { pic: "plank", duration: 30 },
      { pic: "rest", duration: 15 },
      { pic: "mountain-climber", duration: 30 },
      { pic: "burpees", duration: 30 },
    ],
  },
];

// ==== État central ====
const state = {
  phaseIndex: 0,
  exerciseIndex: 0,
  remaining: routine[0].exercises[0].duration,
  running: false,
  timer: null,
};

const main = document.querySelector("main");
const ringAudio = document.getElementById("ring");

// --- Assiduité (localStorage)
const ATT_KEY = "attendance_timestamps";

function toDateKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadAttendance() {
  try {
    const raw = localStorage.getItem(ATT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((v) => Number(v)).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function saveAttendance(arr) {
  try {
    localStorage.setItem(ATT_KEY, JSON.stringify(arr));
  } catch (e) {}
}

function getAttendanceSet() {
  const arr = loadAttendance();
  const s = new Set(arr.map((t) => toDateKey(t)));
  return s;
}

function recordAttendance(ts = Date.now()) {
  // n'ajoute qu'une seule entrée par jour
  try {
    const arr = loadAttendance();
    const key = toDateKey(ts);
    const already = arr.some((t) => toDateKey(t) === key);
    if (!already) {
      arr.push(Number(ts));
      saveAttendance(arr);
    }
  } catch (e) {}
}

function computeStreaks() {
  const set = getAttendanceSet();
  // current streak (consecutive days ending today)
  let current = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const k = toDateKey(d.getTime());
    if (set.has(k)) current++;
    else break;
  }

  // best streak
  const arr = Array.from(set).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const key of arr) {
    const parts = key.split("-").map((p) => Number(p));
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (prev) {
      const diff = Math.round((d - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) run++;
      else run = 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = d;
  }

  return { current, best };
}

function renderAttendanceCalendar(containerId = "calendar", days = 35) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const set = getAttendanceSet();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = toDateKey(d.getTime());
    const el = document.createElement("div");
    el.className = "cal-day" + (set.has(key) ? " active" : "");
    if (toDateKey(Date.now()) === key) el.className += " today";
    const lbl = document.createElement("div");
    lbl.className = "label";
    lbl.textContent = d.getDate();
    el.appendChild(lbl);
    container.appendChild(el);
  }
  const s = computeStreaks();
  const cur = document.getElementById("streakCurrent");
  const best = document.getElementById("streakBest");
  if (cur) cur.textContent = s.current;
  if (best) best.textContent = s.best;
}

// ==== Fonctions ====

// Formatage mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Affichage
function render() {
  const phase = routine[state.phaseIndex];
  const exo = phase.exercises[state.exerciseIndex];

  const streaks = computeStreaks();

  main.innerHTML = `
    <div style="display:flex;gap:1rem;align-items:center;justify-content:center;flex-direction:column;">
      <h2 style="margin-bottom:.25rem">${phase.name}</h2>
      <div style="font-size:1rem;color:#555">Série: <strong id="streakInline">${
        streaks.current
      }</strong> jours</div>
    </div>
    <p>${formatTime(state.remaining)}</p>
    <img src="./img/${exo.pic}.png" />
    <h2>${
      exo.pic.charAt(0).toUpperCase() + exo.pic.slice(1).replace(/-/g, " ")
    }</h2>
    <p>Exercice ${state.exerciseIndex + 1} / ${phase.exercises.length}</p>
  `;
}

// Son de transition — beep court via Web Audio (100ms)
let _audioCtx = null;
function ring() {
  const durationSec = 0.1; // 100ms
  const freq = 1000; // fréquence en Hz
  const peakGain = 0.12; // volume du beep

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("Web Audio non supporté");

    if (!_audioCtx) _audioCtx = new AudioCtx();
    const ctx = _audioCtx;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    // Envelope pour éviter les clics
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.02);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {}
    };
  } catch (e) {
    // Fallback court sur l'élément <audio> si WebAudio indisponible
    try {
      if (!ringAudio) return;
      ringAudio.volume = 0.35;
      ringAudio.currentTime = 0;
      const p = ringAudio.play();
      if (p && typeof p.then === "function") {
        p.then(() =>
          setTimeout(() => {
            try {
              ringAudio.pause();
              ringAudio.currentTime = 0;
            } catch (e) {}
          }, 100)
        ).catch(() => {});
      } else {
        setTimeout(() => {
          try {
            ringAudio.pause();
            ringAudio.currentTime = 0;
          } catch (e) {}
        }, 100);
      }
    } catch (e) {}
  }
}

// Timer
function startTimer() {
  if (state.running) return;
  state.running = true;
  state.timer = setInterval(() => {
    state.remaining--;

    if (state.remaining <= 0) {
      nextExercise();
    }

    render();
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.timer);
  state.timer = null;
  state.running = false;
}

function nextExercise() {
  // enregistre l'achèvement de l'exercice courant
  try {
    recordAttendance();
  } catch (e) {}
  ring();
  state.exerciseIndex++;
  const phase = routine[state.phaseIndex];

  if (state.exerciseIndex >= phase.exercises.length) {
    state.phaseIndex++;
    state.exerciseIndex = 0;

    if (state.phaseIndex >= routine.length) {
      finishRoutine();
      return;
    }
  }

  state.remaining =
    routine[state.phaseIndex].exercises[state.exerciseIndex].duration;
}

// Routine terminée
function finishRoutine() {
  pauseTimer();
  main.innerHTML = `
    <h2>Fini ! 🎉</h2>
    <button id="restart">Recommencer</button>
  `;
  document.getElementById("restart").addEventListener("click", () => {
    state.phaseIndex = 0;
    state.exerciseIndex = 0;
    state.remaining = routine[0].exercises[0].duration;
    render();
  });
}

// ==== Événements boutons ====
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", pauseTimer);
document.getElementById("skip").addEventListener("click", nextExercise);

// Attacher les contrôles d'assiduité
const attendanceBtn = document.getElementById("attendanceBtn");
const attendanceModal = document.getElementById("attendanceModal");
const closeAttendance = document.getElementById("closeAttendance");
if (attendanceBtn && attendanceModal) {
  attendanceBtn.addEventListener("click", () => {
    attendanceModal.setAttribute("aria-hidden", "false");
    renderAttendanceCalendar();
  });
}
if (closeAttendance && attendanceModal) {
  closeAttendance.addEventListener("click", () =>
    attendanceModal.setAttribute("aria-hidden", "true")
  );
}
// fermer en cliquant en dehors
if (attendanceModal) {
  attendanceModal.addEventListener("click", (e) => {
    if (e.target === attendanceModal)
      attendanceModal.setAttribute("aria-hidden", "true");
  });
}

// Premier rendu
render();
