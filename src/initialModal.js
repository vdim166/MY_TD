const startGameButton = document.querySelector("#start-game-button");
const initialModal = document.querySelector("#initial-modal");
const gameInstanceHtml = document.querySelector("#game-instance");

const endModal = document.querySelector("#end-modal");
const winModal = document.querySelector("#win-modal");
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

const loadCurrentEnemyStacks = async () => {
  // mock
  return [
    {
      x: -30,
      y: 250,
      width: 25,
      height: 25,
      color: "yellow",
      whenUpdate: Date.now() + 5000,
      pathIndex: 0,
      isDead: false,
      damage: 50,
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
      damage: 50,
      speed: 500,
      velocity: 40,
      health: 100,
    },
  ];
};

const runGame = async () => {
  enemiesStack = await loadCurrentEnemyStacks();

  stopGame = false;

  gameInstanceHtml.style.display = "block";

  animationFrameId = requestAnimationFrame(gameLoop);
  await startTimer();

  const queue = queues.find((q) => q.name === currentLevel).queue;

  if (!queue) return;

  for (let i = 0; i < queue.length; i++) {
    await queue[i].action();
  }

  // game is over
};

const startAgain = async () => {
  endModal.style.display = "none";
  enemies = [];
  towers = [];

  moneyController.setMoney(100);
  moneyHtml.innerHTML = 100;

  hpController.setHp(100);

  enemiesStack = await loadCurrentEnemyStacks();

  runGame();
};

let levelDisplay = null;
let currentLevel = null;

const levels = [
  {
    name: "1",
    action: async () => {
      levelDisplay = document.createElement("div");
      levelDisplay.classList.add("level-display");
      levelDisplay.innerHTML = "level 1";
    },
  },
];

startGameButton.onclick = () => {
  initialModal.style.display = "none";

  levelDisplay = document.createElement("div");
  levelDisplay.classList.add("modal");

  levelDisplay.innerHTML = `
  <h1>Levels</h1>
  <div class="levels-container">
    ${levels
      .map((level) => {
        const div = document.createElement("div");
        div.onclick = async () => {};
        return `<div class="level-display" onclick="handleLevelClick('${level.name}')">${level.name}</div>`;
      })
      .join("")}
  </div>
  `;

  document.body.appendChild(levelDisplay);
};

async function handleLevelClick(name) {
  currentLevel = name;
  levelDisplay.style.display = "none";
  runGame();
}
