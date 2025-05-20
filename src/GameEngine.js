function moveAlongLine(line, currentPos, distance) {
  const { p1, p2 } = line;

  // Calculate the direction vector of the line
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Calculate the length of the line segment
  const lineLength = Math.sqrt(dx * dx + dy * dy);

  if (lineLength === 0) {
    // Points are identical, can't determine direction
    return { ...currentPos };
  }

  // Calculate unit vector components
  const unitX = dx / lineLength;
  const unitY = dy / lineLength;

  // Calculate new position
  const newX = currentPos.x + unitX * distance;
  const newY = currentPos.y + unitY * distance;

  return { x: newX, y: newY };
}

function drawEmptyCircle(ctx, x, y, radius, color = "black", lineWidth = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2); // Full circle
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke(); // Draw the outline
}

function isPointInCircle(origin, radius, target) {
  // Calculate squared distance (avoid square root for performance)
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distanceSquared = dx * dx + dy * dy;

  // Compare squared distance to squared radius
  return distanceSquared <= radius * radius;
}

function isBeyondLine(line, position) {
  const { p1, p2 } = line;

  // Vector of the line
  const lineVec = { x: p2.x - p1.x, y: p2.y - p1.y };
  const lineLengthSquared = lineVec.x * lineVec.x + lineVec.y * lineVec.y;

  // Vector from p1 to position
  const posVec = { x: position.x - p1.x, y: position.y - p1.y };

  // Calculate projection (dot product)
  const dotProduct = posVec.x * lineVec.x + posVec.y * lineVec.y;

  // Check if before p1 (negative projection)
  if (dotProduct < 0) return { before: true, after: false };

  // Check if after p2 (projection longer than line)
  if (dotProduct > lineLengthSquared) return { before: false, after: true };

  // Still within the line segment
  return { before: false, after: false };
}

class GameEngine {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  drawBackground() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getCanvas() {
    return this.canvas;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPath(points) {
    this.ctx.beginPath();

    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; ++i) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 25;
    this.ctx.stroke();
  }

  drawCastle(castle) {
    // x, y, width, height, color = "#888"

    const { x, y, width, height, color } = castle;

    // Save the current context state
    this.ctx.save();

    // Set castle color
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = "#555";
    this.ctx.lineWidth = 2;

    // Calculate dimensions
    const towerWidth = width * 0.2;
    const towerHeight = height * 0.7;
    const centerWidth = width - 2 * towerWidth;
    const wallHeight = height * 0.5;

    // Draw left tower
    this.ctx.beginPath();
    this.ctx.rect(x, y + height - towerHeight, towerWidth, towerHeight);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw right tower
    this.ctx.beginPath();
    this.ctx.rect(
      x + width - towerWidth,
      y + height - towerHeight,
      towerWidth,
      towerHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Draw center building
    this.ctx.beginPath();
    this.ctx.rect(
      x + towerWidth,
      y + height - wallHeight,
      centerWidth,
      wallHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Draw battlements (top edges)
    const battlementHeight = height * 0.05;
    const battlementWidth = towerWidth * 0.25;

    // Left tower battlements
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.rect(
        x + i * battlementWidth * 1.25,
        y + height - towerHeight - battlementHeight,
        battlementWidth,
        battlementHeight
      );
      this.ctx.fill();
      this.ctx.stroke();
    }

    // Right tower battlements
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.rect(
        x + width - towerWidth + i * battlementWidth * 1.25,
        y + height - towerHeight - battlementHeight,
        battlementWidth,
        battlementHeight
      );
      this.ctx.fill();
      this.ctx.stroke();
    }

    // Center building battlements
    const centerBattlementWidth = centerWidth * 0.1;
    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath();
      this.ctx.rect(
        x + towerWidth + i * centerBattlementWidth * 1.25,
        y + height - wallHeight - battlementHeight,
        centerBattlementWidth,
        battlementHeight
      );
      this.ctx.fill();
      this.ctx.stroke();
    }

    // Draw gate
    this.ctx.fillStyle = "#663300";
    this.ctx.beginPath();
    this.ctx.rect(
      x + width / 2 - centerWidth * 0.15,
      y + height - wallHeight * 0.5,
      centerWidth * 0.3,
      wallHeight * 0.5
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Draw tower tops (conical roofs)
    this.ctx.fillStyle = "#a00";

    // Left tower roof
    this.ctx.beginPath();
    this.ctx.moveTo(
      x + towerWidth / 2,
      y + height - towerHeight - battlementHeight
    );
    this.ctx.lineTo(
      x,
      y + height - towerHeight - battlementHeight - towerWidth / 2
    );
    this.ctx.lineTo(
      x + towerWidth,
      y + height - towerHeight - battlementHeight - towerWidth / 2
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Right tower roof
    this.ctx.beginPath();
    this.ctx.moveTo(
      x + width - towerWidth / 2,
      y + height - towerHeight - battlementHeight
    );
    this.ctx.lineTo(
      x + width - towerWidth,
      y + height - towerHeight - battlementHeight - towerWidth / 2
    );
    this.ctx.lineTo(
      x + width,
      y + height - towerHeight - battlementHeight - towerWidth / 2
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Restore the context state
    this.ctx.restore();
  }

  drawEnemies(enemies) {
    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  }

  drawTempTools(temp) {
    if (!temp) return;

    const { x, y, height, width } = temp;
    this.ctx.fillStyle = "aqua";
    this.ctx.fillRect(x, y, width, height);

    drawEmptyCircle(this.ctx, x + 25, y + 25, 150, "red");
  }

  drawTowers(towers) {
    for (const tower of towers) {
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(tower.x, tower.y, tower.width, tower.height);
      drawEmptyCircle(this.ctx, tower.x + 25, tower.y + 25, 150, "red");
    }
  }
}
