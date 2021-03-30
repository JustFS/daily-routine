const countDownEl = document.getElementById("countdown");
const form = document.querySelector("form");
let index = 0;

const getInputValue = () => {
  let startingMinutes = 10;
  let time = startingMinutes * 60;

  const updateCountdown = () => {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    seconds = seconds < 10 ? "0" + seconds : seconds;

    countDownEl.innerHTML = `${minutes} : ${seconds}`;
    if (time > 0) {
      time--;
    } else {
      countDownEl.innerHTML = `C'est fini !`;
    }

    document.getElementById(
      "pic"
    ).innerHTML = `<img src="./img/${index}.png" alt="">`;

    if (seconds === "01" || (seconds === 30 && minutes === 8)) {
      index++;

      const audio = new Audio();
      audio.src = "ring.mp3";
      audio.play();
    }
  };
  setInterval(updateCountdown, 100);
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  getInputValue();
});
