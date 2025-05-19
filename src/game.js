const gameEngine = new GameEngine();
const canvas = gameEngine.getCanvas();

const TOOLS = { BUY_TOWER: "BUY_TOWER" };

const tooltip = document.querySelector("#tooltip");
let selectedTool = null;

const hpBarHtml = document.querySelector("#hp");
const hpController = new HpController();
const buyTowerButton = document.querySelector("#buy-tower");

let tempTool = null;
const towers = [];

buyTowerButton.onclick = () => {
  buyTowerButton.classList.toggle("selected");

  if (selectedTool === TOOLS.BUY_TOWER) {
    selectedTool = null;
  } else {
    selectedTool = TOOLS.BUY_TOWER;
  }
};

canvas.addEventListener("mousemove", (e) => {
  if (selectedTool === TOOLS.BUY_TOWER) {
    // const canvasRect = canvas.getBoundingClientRect();
    // const mouseX = e.clientX - canvasRect.left;
    // const mouseY = e.clientY - canvasRect.top;
    // const tower = {
    //   x: mouseX,
    //   y: mouseY,
    // };

    tempTool = { x: e.clientX - 25, y: e.clientY - 25, width: 50, height: 50 };
  }
});

canvas.addEventListener("click", (e) => {
  if (selectedTool === TOOLS.BUY_TOWER) {
    selectedTool = null;
    buyTowerButton.classList.toggle("selected");

    towers.push(tempTool);
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

const enemies = [
  {
    x: -30,
    y: 250,
    width: 25,
    height: 25,
    color: "#888",
    whenUpdate: Date.now() + 5000,
    pathIndex: 0,
    isDead: false,
    damage: 15,
    speed: 300,
    velocity: 40,
  },
];

function gameLoop(timestamp) {
  gameEngine.clearCanvas();

  updateGame();
  renderGame();
  requestAnimationFrame(gameLoop);
}

function updateGame() {
  for (let i = 0; i < enemies.length; ++i) {
    const enemy = enemies[i];
    if (enemy.isDead) {
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
          console.log("damage");

          hpBarHtml.innerHTML = hpController.attack(15);

          enemy.isDead = true;
        }
      } else {
        enemy.x = newPosition1.x;
        enemy.y = newPosition1.y;
        enemy.whenUpdate = Date.now() + enemy.speed;
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
