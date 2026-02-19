const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const select = document.getElementById("select");
const winScreen = document.getElementById("win");
const winnerText = document.getElementById("winnerText");

let mode = null;
let speed = 4;
let keys = {};
let gameOver = false;

let p1, p2;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function goToSelect(selectedMode) {
  mode = selectedMode;
  menu.style.display = "none";
  select.style.display = "flex";
}

function startGame(selectedSpeed) {
  speed = selectedSpeed;
  select.style.display = "none";
  canvas.style.display = "block";

  p1 = createPlayer(100, 250, "cyan");
  p2 = createPlayer(700, 250, "orange");

  requestAnimationFrame(loop);
}

function createPlayer(x, y, color) {
  return {
    x, y,
    vx: 0, vy: 0,
    trail: [],
    color,
    score: 0
  };
}

function move() {
  // Player 1
  if (keys["w"]) p1.vy = -speed;
  else if (keys["s"]) p1.vy = speed;
  else p1.vy = 0;

  if (keys["a"]) p1.vx = -speed;
  else if (keys["d"]) p1.vx = speed;
  else p1.vx = 0;

  // Player 2 or AI
  if (mode === "2p") {
    if (keys["ArrowUp"]) p2.vy = -speed;
    else if (keys["ArrowDown"]) p2.vy = speed;
    else p2.vy = 0;

    if (keys["ArrowLeft"]) p2.vx = -speed;
    else if (keys["ArrowRight"]) p2.vx = speed;
    else p2.vx = 0;
  } else {
    p2.vx = p1.x > p2.x ? speed - 1 : -speed + 1;
    p2.vy = p1.y > p2.y ? speed - 1 : -speed + 1;
  }

  updatePlayer(p1);
  updatePlayer(p2);
}

function updatePlayer(p) {
  p.x += p.vx;
  p.y += p.vy;

  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > 100) p.trail.shift();

  // Wall collision
  if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
    endGame(p === p1 ? "ORANGE WINS" : "CYAN WINS");
  }

  // Trail collision
  p1.trail.concat(p2.trail).forEach(t => {
    if (Math.abs(p.x - t.x) < 4 && Math.abs(p.y - t.y) < 4) {
      endGame(p === p1 ? "ORANGE WINS" : "CYAN WINS");
    }
  });
}

function drawPlayer(p) {
  ctx.strokeStyle = p.color;
  ctx.beginPath();
  p.trail.forEach((t, i) => {
    if (i === 0) ctx.moveTo(t.x, t.y);
    else ctx.lineTo(t.x, t.y);
  });
  ctx.stroke();

  ctx.fillStyle = p.color;
  ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
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
  move();
  drawPlayer(p1);
  drawPlayer(p2);

  requestAnimationFrame(loop);
}
