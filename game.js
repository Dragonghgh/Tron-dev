const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");

let mode = null;
let keys = {};

let player1 = { x: 100, y: 250, color: "cyan" };
let player2 = { x: 650, y: 250, color: "magenta" };

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function startGame(selectedMode) {
  mode = selectedMode;
  menu.style.display = "none";
  canvas.style.display = "block";
  requestAnimationFrame(gameLoop);
}

function movePlayers() {
  // Player 1 (WASD)
  if (keys["w"]) player1.y -= 4;
  if (keys["s"]) player1.y += 4;
  if (keys["a"]) player1.x -= 4;
  if (keys["d"]) player1.x += 4;

  // Player 2 (Arrow keys OR AI)
  if (mode === "2p") {
    if (keys["ArrowUp"]) player2.y -= 4;
    if (keys["ArrowDown"]) player2.y += 4;
    if (keys["ArrowLeft"]) player2.x -= 4;
    if (keys["ArrowRight"]) player2.x += 4;
  } else {
    // AI movement
    if (player2.x < player1.x) player2.x += 2;
    if (player2.x > player1.x) player2.x -= 2;
    if (player2.y < player1.y) player2.y += 2;
    if (player2.y > player1.y) player2.y -= 2;
  }
}

function drawPlayer(p) {
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, 20, 20);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayers();

  drawPlayer(player1);
  drawPlayer(player2);

  requestAnimationFrame(gameLoop);
}
