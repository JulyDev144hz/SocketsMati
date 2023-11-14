const canva = document.getElementById("canva");
const ctx = canva.getContext("2d");

let players = [];

function clear() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 800, 800);
}

class Jugador {
  constructor(x, y, width, height, color, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.speed = speed;
    this.vx = 0; // velocidad en el eje x
    this.vy = 0; // velocidad en el eje y
  }

  move(dir) {
    switch (dir) {
      case "N":
        this.vy = -this.speed;

        break;
      case "S":
        this.vy = this.speed;
        break;
      case "E":
        this.vx = this.speed;
        break;
      case "W":
        this.vx = -this.speed;
        break;
      default:
        break;
    }
  }

  stopMove(dir) {
    switch (dir) {
      case "N":
        if (this.vy < 0) {
          this.vy = 0;
        }
        break;
      case "S":
        if (this.vy > 0) {
          this.vy = 0;
        }
        break;
      case "E":
        if (this.vx > 0) {
          this.vx = 0;
        }
        break;
      case "W":
        if (this.vx < 0) {
          this.vx = 0;
        }
        break;
      default:
        break;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y < 0) {
      (this.y = 0), (this.vy = 0);
    }
    if (this.y > 800) {
      (this.y = 800 - this.height), (this.vy = 0);
    }
    if (this.x < 0) {
      (this.x = 0), (this.vx = 0);
    }
    if (this.x > 800) {
      (this.x = 800 - this.width), (this.vx = 0);
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
      player1.move("N");
      break;
    case "s":
      player1.move("S");
      break;
    case "d":
      player1.move("E");
      break;
    case "a":
      player1.move("W");
      break;
    default:
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
      player1.stopMove("N");
      break;
    case "s":
      player1.stopMove("S");
      break;
    case "d":
      player1.stopMove("E");
      break;
    case "a":
      player1.stopMove("W");
      break;
    default:
      break;
  }
});

class Disparo {
  constructor(x, y, angle, color, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.color = color;
    this.speed = speed;
  }

  update() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);

    // Dibujar el disparo
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // Actualizar la distancia recorrida
    this.distanceTraveled += this.speed;
  }
}

let player1 = new Jugador(0, 0, 30, 30, "RED", 4); // Reduje la velocidad para un movimiento más suave
let disparos = [];

canva.addEventListener("click", (e) => {
  const rect = canva.getBoundingClientRect();
  const targetX = e.clientX - rect.left;
  const targetY = e.clientY - rect.top;

  console.log("Target X:", targetX, "Target Y:", targetY);

  // Calcular el ángulo hacia el objetivo
  const angle = Math.atan2(targetY - player1.y, targetX - player1.x);

  // Agregar un nuevo disparo a la lista

  disparos.push(
    new Disparo(
      player1.x + player1.width / 2,
      player1.y + player1.height / 2,
      angle,
      "green",
      5
    )
  );

  socket.emit(
    "shoot",
    new Disparo(
      player1.x + player1.width / 2,
      player1.y + player1.height / 2,
      angle,
      "yellow",
      5
    )
  );
});

setInterval(() => {
  clear();
  player1.update();
  socket.emit("move", { ...player1, playerNumber: playerNumber });

  player2.update();

  // Actualizar y dibujar todos los disparos
  disparos.forEach((disparo, index) => {
    disparo.update();
    // Eliminar disparo si ha alcanzado su destino
    if (disparo.distanceTraveled > 800) {
      disparos.splice(index, 1);
    }
  });
}, 1000 / 144);

const COLORPLAYERS = ["RED", "BLUE"];
let playerNumber = 0;
let player2 = new Jugador(0, 0, 30, 30, "BLUE", 4);

const socket = io();
socket.on("init", (e) => {
  player1.color = "RED";
  playerNumber = e;
});
// socket.on("NewPlayer", (e) => {
// });
socket.on("message", (e) => {
  console.log(e);
});
socket.on("shoot", (e) => {
  disparos.push(
    new Disparo(
      e.x,
      e.y,
      e.angle,
      e.color,
      e.speed
    )
  );
});
socket.on("move", (e) => {
  player2.x = e.x;
  player2.y = e.y;
});
