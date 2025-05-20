const startGameButton = document.querySelector("#start-game-button");
const initialModal = document.querySelector("#initial-modal");

const endModal = document.querySelector("#end-modal");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stopGameLoop() {
  stopGame = true;
  cancelAnimationFrame(animationFrameId);
  // if (animationFrameId) {
  //   cancelAnimationFrame(animationFrameId);
  //   animationFrameId = null;
  // }
}

const timer = document.querySelector("#timer");
const startTimer = async (from = 3) => {
  timer.style.display = "block";
  for (let i = from; i > 0; i--) {
    timer.innerHTML = i;
    await sleep(1000);
  }
  timer.innerHTML = 0;
  timer.style.display = "none";
};

const runGame = async () => {
  stopGame = false;

  animationFrameId = requestAnimationFrame(gameLoop);
  await startTimer();
  for (let i = 0; i < queue.length; i++) {
    await queue[i].action();
  }

  // game is over
};

const startAgain = () => {
  endModal.style.display = "none";
  enemies = [];
  towers = [];

  moneyController.setMoney(100);
  moneyHtml.innerHTML = 100;

  enemiesStack = [
    {
      x: -30,
      y: 250,
      width: 25,
      height: 25,
      color: "yellow",
      whenUpdate: Date.now() + 5000,
      pathIndex: 0,
      isDead: false,
      damage: 15,
      speed: 500,
      velocity: 40,
      health: 100,
    },
    {
      x: -30,
      y: 250,
      width: 25,
      height: 25,
      color: "red",
      whenUpdate: Date.now() + 5000,
      pathIndex: 0,
      isDead: false,
      damage: 15,
      speed: 500,
      velocity: 40,
      health: 100,
    },
  ];

  runGame();
};

startGameButton.onclick = () => {
  initialModal.style.display = "none";
  runGame();
};
