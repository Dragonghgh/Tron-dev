const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const winScreen = document.getElementById("win");
const winnerText = document.getElementById("winnerText");

let mode = null;
let gameOver = false;

const BLOCK_SIZE = 10;
const SPEED = 2;

let p1, p2;

document.addEventListener("keydown", e => {
  if (!gameOver) handleKey(e.key);
});

function startGame(selectedMode) {
  mode = selectedMode;
  menu.style.display = "none";
  canvas.style.display = "block";

  p1 = createPlayer(100, 250, "cyan", "right");
  p2 = createPlayer(700, 250, "orange", "left");

  requestAnimationFrame(loop);
}

function createPlayer(x, y, color, direction) {
  return {
    x, y,
    color,
    dir: direction, // "up", "down", "left", "right"
    trail: []
  };
}

function handleKey(key) {
  // Player 1 WASD
  if (key === "w" && p1.dir !== "down") p1.dir = "up";
  if (key === "s" && p1.dir !== "up") p1.dir = "down";
  if (key === "a" && p1.dir !== "right") p1.dir = "left";
  if (key === "d" && p1.dir !== "left") p1.dir = "right";

  // Player 2 Arrows
  if (mode === "2p") {
    if (key === "ArrowUp" && p2.dir !== "down") p2.dir = "up";
    if (key === "ArrowDown" && p2.dir !== "up") p2.dir = "down";
    if (key === "ArrowLeft" && p2.dir !== "right") p2.dir = "left";
    if (key === "ArrowRight" && p2.dir !== "left") p2.dir = "right";
  }
}

function movePlayer(p) {
  if (p.dir === "up") p.y -= SPEED;
  if (p.dir === "down") p.y += SPEED;
  if (p.dir === "left") p.x -= SPEED;
  if (p.dir === "right") p.x += SPEED;

  // Add new block to trail
  p.trail.push({ x: p.x, y: p.y });

  // Check wall collision
  if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) {
    endGame(p.color === "cyan" ? "ORANGE WINS" : "CYAN WINS");
  }

  // Check trail collision
  const allTrails = p1.trail.concat(p2.trail);
  for (let t of allTrails) {
    if (Math.abs(p.x - t.x) < BLOCK_SIZE && Math.abs(p.y - t.y) < BLOCK_SIZE) {
      endGame(p.color === "cyan" ? "ORANGE WINS" : "CYAN WINS");
    }
  }
}

function drawPlayer(p) {
  ctx.fillStyle = p.color;
  for (let block of p.trail) {
    ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
  }
  ctx.fillRect(p.x, p.y, BLOCK_SIZE, BLOCK_SIZE);
}

function endGame(text) {
  gameOver = true;
  canvas.style.display = "none";
  winScreen.style.display = "flex";
  winnerText.textContent = text;
}

function loop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer(p1);
  movePlayer(p2);

  drawPlayer(p1);
  drawPlayer(p2);

  requestAnimationFrame(loop);
}
