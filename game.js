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

  // Start players apart and stationary
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

// Check if a position will collide with wall or any trail
function isBlocked(x, y) {
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return true;
  const allTrails = p1.trail.concat(p2.trail);
  for (let t of allTrails) {
    if (Math.abs(x - t.x) < SPEED && Math.abs(y - t.y) < SPEED) return true;
  }
  return false;
}

// Move player in grid direction
function movePlayer(p, started) {
  if (!started || !p.dir) return;

  let nextX = p.x;
  let nextY = p.y;

  if (p.dir === "up") nextY -= SPEED;
  if (p.dir === "down") nextY += SPEED;
  if (p.dir === "left") nextX -= SPEED;
  if (p.dir === "right") nextX += SPEED;

  if (isBlocked(nextX, nextY)) {
    endGame(p.color === "cyan" ? "ORANGE WINS" : "CYAN WINS");
    return;
  }

  p.x = nextX;
  p.y = nextY;
  p.trail.push({ x: p.x, y: p.y });
}

// AI logic
function moveAI() {
  if (mode !== "1p") return;
  if (!player1Started) return;

  // Attempt to move toward player, prefer horizontal if farther
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

  let preferredDir;
  if (Math.abs(dx) > Math.abs(dy)) {
    preferredDir = dx > 0 ? "right" : "left";
  } else {
    preferredDir = dy > 0 ? "down" : "up";
  }

  // Check if preferred direction is blocked
  let nextX = p2.x;
  let nextY = p2.y;
  if (preferredDir === "up") nextY -= SPEED;
  if (preferredDir === "down") nextY += SPEED;
  if (preferredDir === "left") nextX -= SPEED;
  if (preferredDir === "right") nextX += SPEED;

  if (!isBlocked(nextX, nextY)) {
    p2.dir = preferredDir;
  } else {
    // Try a safe turn: clockwise or counter-clockwise
    const dirs = ["up","right","down","left"];
    let idx = dirs.indexOf(p2.dir);
    for (let i=1;i<=3;i++) {
      const testDir = dirs[(idx+i)%4];
      let tx = p2.x;
      let ty = p2.y;
      if (testDir === "up") ty -= SPEED;
      if (testDir === "down") ty += SPEED;
      if (testDir === "left") tx -= SPEED;
      if (testDir === "right") tx += SPEED;
      if (!isBlocked(tx, ty)) {
        p2.dir = testDir;
        break;
      }
    }
  }

  player2Started = true;
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
