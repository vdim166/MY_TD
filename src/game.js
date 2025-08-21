const gameEngine = new GameEngine();
const canvas = gameEngine.getCanvas();
let animationFrameId = null;

const moneyController = new MoneyController(100);

const moneyHtml = document.querySelector("#money");
moneyHtml.innerHTML = moneyController.getMoney();

const TOOLS = { BUY_TOWER: "BUY_TOWER" };

const tooltip = document.querySelector("#tooltip");
let selectedTool = null;

const hpBarHtml = document.querySelector("#hp");
const hpController = new HpController();
const buyTowerButton = document.querySelector("#buy-tower");

let tempTool = null;
let towers = [];

buyTowerButton.onclick = () => {
  buyTowerButton.classList.toggle("selected");

  if (selectedTool === TOOLS.BUY_TOWER) {
    selectedTool = null;
    tempTool = null;
  } else {
    selectedTool = TOOLS.BUY_TOWER;
  }
};

let stopGame = true;

canvas.addEventListener("mousemove", (e) => {
  if (selectedTool === TOOLS.BUY_TOWER) {
    tempTool = { x: e.clientX - 25, y: e.clientY - 25, width: 50, height: 50 };
  }
});

canvas.addEventListener("click", (e) => {
  if (selectedTool === TOOLS.BUY_TOWER) {
    selectedTool = null;
    buyTowerButton.classList.toggle("selected");

    const newTower = { ...tempTool };

    newTower.attackPeriod = Date.now();
    newTower.damage = 50;

    const { status, money } = moneyController.spendMoney(50);

    if (status) {
      moneyHtml.innerHTML = money;

      towers.push(newTower);
    }

    tempTool = null;
  }
});

const currentPath = [
  {
    x: 0,
    y: 250,
  },
  {
    x: canvas.width / 2,
    y: 250,
  },
  {
    x: canvas.width / 2,
    y: 450,
  },
  {
    x: canvas.width / 2 + 300,
    y: 450,
  },
];

let enemies = [];

let enemiesStack = null;
const queues = [
  {
    name: "1",
    queue: [
      {
        name: "wait",
        action: async () => {
          await new Promise((res) => setTimeout(res, 3000));
        },
      },
      {
        name: "add enemy",
        action: () => {
          const enemy = enemiesStack[0];
          enemies.push(enemy);
          enemiesStack.splice(0, 1);
        },
      },
      {
        name: "wait",
        action: async () => {
          await new Promise((res) => setTimeout(res, 5000));
        },
      },
      {
        name: "add enemy",
        action: () => {
          const enemy = enemiesStack[0];
          enemies.push(enemy);
          enemiesStack.splice(0, 1);
        },
      },
    ],
  },
];

function gameLoop(timestamp) {
  if (stopGame) return;
  gameEngine.clearCanvas();

  updateGame();
  renderGame();
  animationFrameId = requestAnimationFrame(gameLoop);
}

const winHandle = () => {
  console.log("game is over");
  winModal.style.display = "block";

  stopGameLoop();

  const index = levels.findIndex((l) => l.name === currentLevel);

  const isLast = index === levels.length - 1;

  if (isLast) {
    companyEndHandle();
  } else {
    nextLevel();
  }
};

let companyEndModal = null;

const companyEndHandle = () => {
  companyEndModal = document.createElement("div");
  companyEndModal.classList.add("modal", "company-end-modal");

  companyEndModal.innerHTML = `
  <h1>Congratulations!</h1>
  <button onclick="goToMainMenu()">Go back</button>
  `;
  document.body.appendChild(companyEndModal);
};

const nextLevel = () => {
  winModal.style.display = "none";

  currentLevel = levels[index + 1].name;
  runGame();
};

const loseHandle = () => {
  console.log("You lose");
  endModal.style.display = "block";

  stopGameLoop();
};

function updateGame() {
  let enemiesDead = 0;

  const queue = queues.find((q) => q.name === currentLevel).queue;

  if (!queue) return;

  const allEnemiesInLevel = queue.filter((a) => a.name === "add enemy").length;

  for (let i = 0; i < enemies.length; ++i) {
    const enemy = enemies[i];

    if (enemy.isDead) {
      enemiesDead += 1;
      continue;
    }

    if (enemy.health <= 0) {
      enemy.isDead = true;
      enemiesDead += 1;

      const money = moneyController.addMoney(10);
      moneyHtml.innerHTML = money;
      continue;
    }

    const path = currentPath[enemy.pathIndex];
    const nextPath = currentPath[enemy.pathIndex + 1];
    const myLine = {
      p1: { x: path.x, y: path.y },
      p2: { x: nextPath.x, y: nextPath.y },
    };

    if (enemy.whenUpdate < Date.now()) {
      const newPosition1 = moveAlongLine(
        myLine,
        { x: enemy.x, y: enemy.y },
        enemy.velocity
      );

      const { after } = isBeyondLine(myLine, {
        x: newPosition1.x,
        y: newPosition1.y,
      });

      if (after) {
        enemy.x = nextPath.x;
        enemy.y = nextPath.y;
        enemy.whenUpdate = Date.now() + enemy.speed;

        enemy.pathIndex += 1;

        if (currentPath.length - 1 === enemy.pathIndex) {
          // should do damage
          console.log("damage", enemy);

          hpBarHtml.innerHTML = hpController.attack(enemy.damage);

          enemy.isDead = true;
        }
      } else {
        enemy.x = newPosition1.x;
        enemy.y = newPosition1.y;
        enemy.whenUpdate = Date.now() + enemy.speed;
      }
    }

    // towers
  }

  if (hpController.isDead()) {
    loseHandle();
    return;
  }

  if (enemiesDead === allEnemiesInLevel) {
    winHandle();
    return;
  }

  for (let i = 0; i < towers.length; ++i) {
    const tower = towers[i];

    if (tower.attackPeriod > Date.now()) {
      continue;
    }

    for (let j = 0; j < enemies.length; ++j) {
      const enemy = enemies[j];
      if (enemy.isDead) {
        continue;
      }

      const isInCircle = isPointInCircle({ x: tower.x, y: tower.y }, 150, {
        x: enemy.x,
        y: enemy.y,
      });

      if (isInCircle) {
        // do damage to enemy
        console.log("attack");
        tower.attackPeriod = Date.now() + 2000;
        enemy.health -= tower.damage;
      }
    }
  }
}

function renderGame() {
  gameEngine.drawBackground();
  gameEngine.drawPath(currentPath);

  gameEngine.drawTempTools(tempTool);
  gameEngine.drawTowers(towers);

  const castle = {
    ...currentPath[currentPath.length - 1],
    width: 100,
    height: 150,
    color: "#888",
  };

  castle.y -= castle.height - 15;

  gameEngine.drawCastle(castle);
  gameEngine.drawEnemies(enemies);
}

const goToMainMenu = () => {
  document.body.removeChild(companyEndModal);
  companyEndModal = null;
  gameInstanceHtml.style.display = "none";
  initialModal.style.display = "block";
  winModal.style.display = "none";
};
