const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const colorSelect = document.getElementById("colorSelect");
const select = document.getElementById("select");
const winScreen = document.getElementById("win");
const winnerText = document.getElementById("winnerText");

let mode = null;
let gameOver = false;
let SPEED = 10;

let p1, p2;
let player1Started = false;
let player2Started = false;

// Scores
let score1 = 0;
let score2 = 0;
const WIN_SCORE = 3;

// Default player colors
let playerColors = { p1: "cyan", p2: "orange" };

// Trail fade settings
const FADE_SPEED = 0.95;
const TRAIL_MAX_LENGTH = 100;

// Grid
const GRID_SIZE = 40;
let gridOffset = 0;

// Particles
let particles = [];

document.addEventListener("keydown", e => {
  if (!gameOver) handleKey(e.key);
});

// MENU → COLOR SELECT
function goToColorSelect(selectedMode) {
  mode = selectedMode;
  menu.style.display = "none";
  colorSelect.style.display = "flex";
}

// COLOR CHOICE
function chooseColor(color) {
  playerColors.p1 = color;
  playerColors.p2 = color === "cyan" ? "orange" : "cyan";
  colorSelect.style.display = "none";
  select.style.display = "flex";
}

// START GAME
function startGame(speed) {
  SPEED = speed;
  select.style.display = "none";
  canvas.style.display = "block";
  startRound();
}

// START ROUND
function startRound() {
  gameOver = false;
  player1Started = false;
  player2Started = false;
  particles = [];

  p1 = createPlayer(100, 250, playerColors.p1, null);
  p2 = createPlayer(700, 250, playerColors.p2, null);

  drawScore();
  requestAnimationFrame(loop);
}

// CREATE PLAYER
function createPlayer(x, y, color, dir) {
  return { x, y, color, dir, trail: [] };
}

// KEY HANDLER
function handleKey(key) {
  if (!player1Started) player1Started = true;
  if (!player2Started && mode === "2p") player2Started = true;

  // Player 1
  if (key === "w" && p1.dir !== "down") p1.dir = "up";
  if (key === "s" && p1.dir !== "up") p1.dir = "down";
  if (key === "a" && p1.dir !== "right") p1.dir = "left";
  if (key === "d" && p1.dir !== "left") p1.dir = "right";

  // Player 2
  if (mode === "2p") {
    if (key === "ArrowUp" && p2.dir !== "down") p2.dir = "up";
    if (key === "ArrowDown" && p2.dir !== "up") p2.dir = "down";
    if (key === "ArrowLeft" && p2.dir !== "right") p2.dir = "left";
    if (key === "ArrowRight" && p2.dir !== "left") p2.dir = "right";
  }
}

// CHECK COLLISION
function isBlocked(x, y) {
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return true;
  const allTrails = p1.trail.concat(p2.trail);
  for (let t of allTrails) {
    if (Math.abs(x - t.x) < SPEED && Math.abs(y - t.y) < SPEED) return true;
  }
  return false;
}

// MOVE PLAYER
function movePlayer(p, started) {
  if (!started || !p.dir) return;

  let nextX = p.x;
  let nextY = p.y;

  if (p.dir === "up") nextY -= SPEED;
  if (p.dir === "down") nextY += SPEED;
  if (p.dir === "left") nextX -= SPEED;
  if (p.dir === "right") nextX += SPEED;

  if (isBlocked(nextX, nextY)) {
    spawnCrashParticles(p);
    roundOver(p.color === playerColors.p1 ? playerColors.p2 : playerColors.p1);
    return;
  }

  p.x = nextX;
  p.y = nextY;
  p.trail.push({ x: p.x, y: p.y, alpha: 1 });
  if (p.trail.length > TRAIL_MAX_LENGTH) p.trail.shift();
}

// SIMPLE AI
function moveAI() {
  if (mode !== "1p") return;
  if (!player1Started) return;

  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

  let preferredDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");

  let nextX = p2.x;
  let nextY = p2.y;
  if (preferredDir === "up") nextY -= SPEED;
  if (preferredDir === "down") nextY += SPEED;
  if (preferredDir === "left") nextX -= SPEED;
  if (preferredDir === "right") nextX += SPEED;

  if (!isBlocked(nextX, nextY)) p2.dir = preferredDir;
  else {
    const dirs = ["up","right","down","left"];
    let idx = dirs.indexOf(p2.dir);
    for (let i=1;i<=3;i++) {
      const testDir = dirs[(idx+i)%4];
      let tx = p2.x, ty = p2.y;
      if (testDir === "up") ty -= SPEED;
      if (testDir === "down") ty += SPEED;
      if (testDir === "left") tx -= SPEED;
      if (testDir === "right") tx += SPEED;
      if (!isBlocked(tx, ty)) { p2.dir = testDir; break; }
    }
  }

  player2Started = true;
}

// DRAW PLAYER WITH GLOW
function drawPlayer(p) {
  for (let block of p.trail) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = block.alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = p.color;
    ctx.fillRect(block.x, block.y, SPEED*1.2, SPEED*1.2);
    block.alpha *= FADE_SPEED;
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

// SPAWN CRASH PARTICLES
function spawnCrashParticles(player) {
  for (let i=0; i<30; i++) {
    particles.push({
      x: player.x + SPEED/2,
      y: player.y + SPEED/2,
      vx: (Math.random()-0.5)*6,
      vy: (Math.random()-0.5)*6,
      alpha: 1,
      color: player.color,
      size: Math.random()*3 + 1
    });
  }
}

// UPDATE PARTICLES
function updateParticles() {
  for (let i = particles.length -1; i>=0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha *= 0.95;
    if (p.alpha < 0.05) particles.splice(i, 1);
  }
}

// DRAW PARTICLES
function drawParticles() {
  for (let p of particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

// DRAW TRON GRID
function drawGrid() {
  ctx.strokeStyle = "rgba(0,255,255,0.05)";
  ctx.lineWidth = 1;
  gridOffset += 0.5;
  if (gridOffset >= GRID_SIZE) gridOffset = 0;

  for (let x = -GRID_SIZE + gridOffset; x < canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = -GRID_SIZE + gridOffset; y < canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// ROUND OVER
function roundOver(winnerColor) {
  gameOver = true;
  if (winnerColor === playerColors.p1) score1++;
  else score2++;

  if (score1 >= WIN_SCORE) showMatchWinner(playerColors.p1);
  else if (score2 >= WIN_SCORE) showMatchWinner(playerColors.p2);
  else setTimeout(startRound, 1000);
}

// DRAW SCORE ON TOP
function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = playerColors.p1;
  ctx.fillText(`Player 1: ${score1}`, 20, 30);
  ctx.fillStyle = playerColors.p2;
  ctx.fillText(`Player 2: ${score2}`, canvas.width - 140, 30);
}

// MATCH WINNER
function showMatchWinner(color) {
  canvas.style.display = "none";
  winScreen.style.display = "flex";
  winnerText.textContent = `${color.toUpperCase()} WINS THE MATCH!`;
}

// MAIN LOOP
function loop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  moveAI();
  movePlayer(p1, player1Started);
  movePlayer(p2, player2Started);

  drawPlayer(p1);
  drawPlayer(p2);

  updateParticles();
  drawParticles();

  drawScore();

  requestAnimationFrame(loop);
}
