const countDownEl = document.getElementById("countdown");
const form = document.querySelector("form");
const minutesValue = document.getElementById("minutesValue");
const positionImg = document.getElementById("pic");
let index = 0;
let time;
let interval;

const start = () => {
  let startingMinutes = minutesValue.value * 10;
  time = startingMinutes * 60;
};

const updateCountdown = () => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  seconds = seconds < 10 ? "0" + seconds : seconds;

  countDownEl.innerHTML = `${minutes} : ${seconds}`;
  positionImg.innerHTML = `<img src="./img/${index}.png">`;

  if (minutesValue.value === 1 && seconds === "01") {
    index++;
    ring();
    if (seconds === 30 && index === 1) ring();
    if (seconds === 30 && index === 6) ring();
  } else if (minutes % minutesValue.value === 0 && seconds === "01") {
    index++;
    ring();
  }

  if (time > 0) time--;
  else countDownEl.innerHTML = `C'est fini !`;
};

const ring = () => {
  const audio = new Audio();
  audio.src = "ring.mp3";
  audio.play();
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  start();
  clearInterval(interval);
  interval = setInterval(updateCountdown, 1000);
});
