const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const select = document.getElementById("select");
const winScreen = document.getElementById("win");
const winnerText = document.getElementById("winnerText");

let mode = null;
let gameOver = false;
let SPEED = 10;

let p1, p2;
let player1Started = false;
let player2Started = false;

document.addEventListener("keydown", e => {
  if (!gameOver) handleKey(e.key);
});

function goToSelect(selectedMode) {
  mode = selectedMode;
  menu.style.display = "none";
  select.style.display = "flex";
}

function startGame(speed) {
  SPEED = speed;
  select.style.display = "none";
  canvas.style.display = "block";

  // Players start apart and stationary
  p1 = createPlayer(100, 250, "cyan", null);
  p2 = createPlayer(700, 250, "orange", null);

  player1Started = false;
  player2Started = false;

  requestAnimationFrame(loop);
}

function createPlayer(x, y, color, dir) {
  return {
    x, y,
    color,
    dir,
    trail: []
  };
}

function handleKey(key) {
  // Player 1 starts moving on input
  if (!player1Started) player1Started = true;
  if (!player2Started && mode === "2p") player2Started = true;

  // Player 1 keys
  if (key === "w" && p1.dir !== "down") p1.dir = "up";
  if (key === "s" && p1.dir !== "up") p1.dir = "down";
  if (key === "a" && p1.dir !== "right") p1.dir = "left";
  if (key === "d" && p1.dir !== "left") p1.dir = "right";

  // Player 2 keys
  if (mode === "2p") {
    if (key === "ArrowUp" && p2.dir !== "down") p2.dir = "up";
    if (key === "ArrowDown" && p2.dir !== "up") p2.dir = "down";
    if (key === "ArrowLeft" && p2.dir !== "right") p2.dir = "left";
    if (key === "ArrowRight" && p2.dir !== "left") p2.dir = "right";
  }
}

function movePlayer(p, started) {
  if (!started || !p.dir) return; // stay still if not started

  if (p.dir === "up") p.y -= SPEED;
  if (p.dir === "down") p.y += SPEED;
  if (p.dir === "left") p.x -= SPEED;
  if (p.dir === "right") p.x += SPEED;

  p.trail.push({ x: p.x, y: p.y });

  // Wall collision
  if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) {
    endGame(p.color === "cyan" ? "ORANGE WINS" : "CYAN WINS");
  }

  // Trail collision (ignore last block)
  const allTrails = p1.trail.concat(p2.trail);
  for (let i = 0; i < allTrails.length - 1; i++) {
    const t = allTrails[i];
    if (Math.abs(p.x - t.x) < SPEED && Math.abs(p.y - t.y) < SPEED) {
      endGame(p.color === "cyan" ? "ORANGE WINS" : "CYAN WINS");
    }
  }
}

// AI only moves after Player 1 starts
function moveAI() {
  if (mode !== "1p") return;
  if (!player1Started) return;

  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

  // Decide horizontal or vertical first
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && p2.dir !== "left") p2.dir = "right";
    else if (dx < 0 && p2.dir !== "right") p2.dir = "left";
  } else {
    if (dy > 0 && p2.dir !== "up") p2.dir = "down";
    else if (dy < 0 && p2.dir !== "down") p2.dir = "up";
  }

  player2Started = true; // AI now starts
}

function drawPlayer(p) {
  ctx.fillStyle = p.color;
  for (let block of p.trail) {
    ctx.fillRect(block.x, block.y, SPEED, SPEED);
  }
  if (p.dir) ctx.fillRect(p.x, p.y, SPEED, SPEED);
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

  moveAI();
  movePlayer(p1, player1Started);
  movePlayer(p2, player2Started);

  drawPlayer(p1);
  drawPlayer(p2);

  setTimeout(() => requestAnimationFrame(loop), 50);
}
