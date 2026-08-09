// ==== Données de la routine ====
const routine = [
  {
    name: "Étirements",
    // 9min
    exercises: [
      { pic: "hip-opener", duration: 15 },
      { pic: "hip-opener", duration: 15 },
      { pic: "standing-forward-fold", duration: 90 },
      { pic: "shoulder-opening", duration: 30 },
      { pic: "plow-pose", duration: 60 },
      { pic: "cobra-pose", duration: 120 },
      { pic: "calf-stretch", duration: 45 },
      { pic: "calf-stretch", duration: 45 },
      { pic: "child-pose", duration: 90 },
    ],
  },
  {
    name: "Renforcement",
    // 6min
    exercises: [
      { pic: "plank", duration: 90 },
      { pic: "squat", duration: 60 },
      { pic: "pushup", duration: 60 },
      { pic: "burpees", duration: 30 },
    ],
  },
];
const etirementsLongs = [
  // 21min30
  {
    name: "Étirements 🤸🏻‍♂️",
    // 14min30
    exercises: [
      { pic: "hip-opener", duration: 15 },
      { pic: "hip-opener", duration: 15 },
      { pic: "standing-forward-fold", duration: 180 },
      { pic: "shoulder-opening", duration: 30 },
      { pic: "plow-pose", duration: 60 },
      { pic: "cobra-pose", duration: 180 },
      { pic: "calf-stretch", duration: 60 },
      { pic: "calf-stretch", duration: 60 },
      { pic: "child-pose", duration: 180 },
    ],
  },
  {
    name: "Renforcement 💪",
    // 6min
    exercises: [
      { pic: "plank", duration: 90 },
      { pic: "squat", duration: 60 },
      { pic: "pushup", duration: 60 },
      { pic: "burpees", duration: 30 },
    ],
  },
];
const versionLongue = [
  //23min45
  {
    name: "Étirements 🤸🏻‍♂️",
    // 14min30
    exercises: [
      { pic: "hip-opener", duration: 15 },
      { pic: "hip-opener", duration: 15 },
      { pic: "standing-forward-fold", duration: 120 },
      { pic: "shoulder-opening", duration: 30 },
      { pic: "plow-pose", duration: 60 },
      { pic: "cobra-pose", duration: 120 },
      { pic: "calf-stretch", duration: 45 },
      { pic: "calf-stretch", duration: 45 },
      { pic: "child-pose", duration: 180 },
    ],
  },
  {
    name: "Renforcement 💪",
    // 7min30
    exercises: [
      { pic: "plank", duration: 180 },
      { pic: "squat", duration: 60 },
      { pic: "pushup", duration: 120 },
      { pic: "burpees", duration: 60 },
    ],
  },
];
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
    "0",
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
      return true; // nouvelle entrée ajoutée
    }
    return false; // déjà présent pour la journée
  } catch (e) {
    return false;
  }
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

let calendarOffset = 0;
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function renderAttendanceCalendar(containerId = "calendar", monthOffset = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const set = getAttendanceSet();
  const today = new Date();
  const firstOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  );
  const lastOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset + 1,
    0,
  );

  // start from the Sunday before (or equal) the first of month
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  // end on the Saturday after (or equal) the last of month
  const end = new Date(lastOfMonth);
  end.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toDateKey(d.getTime());
    const el = document.createElement("div");
    el.className = "cal-day" + (set.has(key) ? " active" : "");
    if (d.getMonth() !== firstOfMonth.getMonth())
      el.className += " adjacent-month";
    if (monthOffset === 0 && toDateKey(Date.now()) === key)
      el.className += " today";
    const lbl = document.createElement("div");
    lbl.className = "label";
    lbl.textContent = d.getDate();
    el.appendChild(lbl);
    container.appendChild(el);
  }

  const monthLabel = document.getElementById("calendarMonth");
  if (monthLabel)
    monthLabel.textContent = `${
      MONTHS_FR[firstOfMonth.getMonth()]
    } ${firstOfMonth.getFullYear()}`;

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

function dayLabel(count) {
  return count <= 1 ? "jour" : "jours";
}

// Affichage
function render() {
  const phase = routine[state.phaseIndex];
  const exo = phase.exercises[state.exerciseIndex];
  const streaks = computeStreaks();
  const exerciseProgress = Math.round((state.remaining / exo.duration) * 100);
  const routineProgress = Math.round(
    (state.exerciseIndex / phase.exercises.length) * 100,
  );
  const exerciseLabel =
    exo.pic.charAt(0).toUpperCase() + exo.pic.slice(1).replace(/-/g, " ");

  main.innerHTML = `
    <section class="hero-card">
      <div class="hero-header">
        <div>
          <span class="eyebrow">Routine active</span>
          <h2>${phase.name}</h2>
        </div>

        <div class="hero-right">
          <button class="attendance-chip" id="attendanceBtn" type="button" aria-label="Voir l'assiduité">
            <span>${streaks.current} ${dayLabel(streaks.current)} assiduité</span>
          </button>
          <span class="phase-badge">${routineProgress}% complété</span>
        </div>
      </div>

      <div class="progress-block">
        <div class="progress-ring" style="--progress:${exerciseProgress};">
          <div class="timer-value">${formatTime(state.remaining)}</div>
        </div>

        <div class="exercise-meta">
          <div class="meta-title">${exerciseLabel}</div>
          <div class="meta-sub">Exercice ${state.exerciseIndex + 1} / ${phase.exercises.length}</div>
        </div>
      </div>

      <div class="image-container">
        <img src="./img/${exo.pic}.png" alt="${exerciseLabel}" />
      </div>
    </section>
  `;
}

// Petit toast de confirmation affiché en bas de l'écran
function showToast(msg, duration = 1800) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.setAttribute("aria-hidden", "false");
  t.classList.add("show");
  if (t._timeout) clearTimeout(t._timeout);
  t._timeout = setTimeout(() => {
    t.classList.remove("show");
    t.setAttribute("aria-hidden", "true");
  }, duration);
}

// Calcul de la durée totale d'une routine (en secondes)
function computeTotalDuration(rout) {
  return rout.reduce((total, phase) => {
    return (
      total +
      (phase.exercises || []).reduce((s, ex) => s + Number(ex.duration || 0), 0)
    );
  }, 0);
}

// Formatage en "15min" ou "21m30" si secondes non-nulles
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}m${String(s).padStart(2, "0")}`;
}

function updateButtonDurations() {
  const mappings = [
    { id: "start", routineRef: routine },
    { id: "startLong", routineRef: etirementsLongs },
    { id: "versionLongue", routineRef: versionLongue },
  ];
  mappings.forEach(({ id, routineRef }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const sub = btn.querySelector(".btn-sub");
    if (!sub) return;
    sub.textContent = formatDuration(computeTotalDuration(routineRef));
  });
}

// initial update des labels de durée
updateButtonDurations();

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
          }, 100),
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
  // Enregistre l'assiduité au démarrage de la routine (une seule entrée par jour)
  try {
    const added = recordAttendance();
    if (added) showToast("Assiduité enregistrée ✔");
  } catch (e) {}
  // Met à jour l'affichage immédiatement pour refléter l'assiduité
  render();

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

// Démarre une routine donnée (remplace le contenu de `routine` puis démarre le timer)
function startSelectedRoutine(newRoutine) {
  try {
    pauseTimer();
    if (!Array.isArray(newRoutine) || newRoutine.length === 0) return;

    // Remplace le contenu du tableau `routine` sans réaffecter la const
    routine.length = 0;
    newRoutine.forEach((r) => routine.push(r));

    state.phaseIndex = 0;
    state.exerciseIndex = 0;
    state.remaining = routine[0].exercises[0].duration;

    render();
    startTimer();
  } catch (e) {}
}

document.getElementById("start").addEventListener("click", startTimer);
// Bouton pour lancer les étirements longs
const startLongBtn = document.getElementById("startLong");
if (startLongBtn)
  startLongBtn.addEventListener("click", () =>
    startSelectedRoutine(etirementsLongs),
  );

// Bouton pour lancer la "Version longue"
const versionLongBtn = document.getElementById("versionLongue");
if (versionLongBtn)
  versionLongBtn.addEventListener("click", () =>
    startSelectedRoutine(versionLongue),
  );

document.getElementById("pause").addEventListener("click", pauseTimer);
document.getElementById("skip").addEventListener("click", nextExercise);
// Premier rendu
render();

// Attacher les contrôles d'assiduité via délégation (un seul écouteur, fonctionne si le bouton est recréé)
const attendanceModal = document.getElementById("attendanceModal");
const closeAttendance = document.getElementById("closeAttendance");
document.addEventListener("click", (e) => {
  const target =
    e.target instanceof Element ? e.target : e.target.parentElement;
  const btn =
    target && target.closest ? target.closest("#attendanceBtn") : null;
  if (btn && attendanceModal) {
    attendanceModal.setAttribute("aria-hidden", "false");
    renderAttendanceCalendar("calendar", calendarOffset);
  }
});

if (closeAttendance && attendanceModal) {
  closeAttendance.addEventListener("click", () =>
    attendanceModal.setAttribute("aria-hidden", "true"),
  );
}
// fermer en cliquant en dehors
if (attendanceModal) {
  attendanceModal.addEventListener("click", (e) => {
    if (e.target === attendanceModal)
      attendanceModal.setAttribute("aria-hidden", "true");
  });
}

// navigation mois précédent / suivant
const calPrev = document.getElementById("calPrev");
const calNext = document.getElementById("calNext");
if (calPrev) {
  calPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    calendarOffset--;
    renderAttendanceCalendar("calendar", calendarOffset);
  });
}
if (calNext) {
  calNext.addEventListener("click", (e) => {
    e.stopPropagation();
    calendarOffset++;
    renderAttendanceCalendar("calendar", calendarOffset);
  });
}
