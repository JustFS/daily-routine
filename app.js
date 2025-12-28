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

  main.innerHTML = `
    <h2>${phase.name}</h2>
    <p>${formatTime(state.remaining)}</p>
    <img src="./img/${exo.pic}.png" />
    <h2>${
      exo.pic.charAt(0).toUpperCase() + exo.pic.slice(1).replace(/-/g, " ")
    }</h2>
    <p>Exercice ${state.exerciseIndex + 1} / ${phase.exercises.length}</p>
  `;
}

// Son de transition
function ring() {
  ringAudio.currentTime = 0;
  ringAudio.play();
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

// Premier rendu
render();
