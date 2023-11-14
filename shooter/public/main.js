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
    this.health = 5
    this.tipoArma = 0
    this.velocidadDeDisparo = 50
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
    if (this.health <= 0) {
      return
    }
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
    case "1":
      player1.tipoArma = 0
      break;
    case "2":
      player1.tipoArma = 1
      break;
    case "3":
      player1.tipoArma = 2
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
  constructor(x, y, width, angle, color, speed, maxDistance) {
    this.x = x;
    this.y = y;
    this.width = width
    this.angle = angle;
    this.color = color;
    this.speed = speed;
    this.distanceTraveled = 0
    this.maxDistance = maxDistance
    this.hit = false
  }

  update() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);

    // Dibujar el disparo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // Actualizar la distancia recorrida
    this.distanceTraveled += this.speed;
  }
}

let player1 = new Jugador(0, 0, 30, 30, "RED", 4); // Reduje la velocidad para un movimiento más suave
let disparos = [];
const disparar = (e) => {
  const rect = canva.getBoundingClientRect();
  const targetX = e.clientX - rect.left;
  const targetY = e.clientY - rect.top;

  console.log("Target X:", targetX, "Target Y:", targetY);

  // Calcular el ángulo hacia el objetivo
  const angle = Math.atan2(targetY - player1.y, targetX - player1.x);

  // Agregar un nuevo disparo a la lista

  let posx = player1.x + player1.width / 2
  let posy = player1.y + player1.height / 2

  if (player1.tipoArma == 0) {
    let width = 10
    let speed = 7
    player1.velocidadDeDisparo = 50
    disparos.push(new Disparo(
      posx,
      posy,
      width,
      angle,
      "RED",
      speed,
      400
    ))
    socket.emit("shoot", new Disparo(
      posx,
      posy,
      width,
      angle,
      "BLUE",
      speed,
      400
    ))
  } else if (player1.tipoArma == 1) {
    let width = 50
    let speed = 1
    player1.velocidadDeDisparo = 500
    disparos.push(new Disparo(
      posx,
      posy,
      width,
      angle,
      "RED",
      speed,
      800
    ))
    socket.emit("shoot", new Disparo(
      posx,
      posy,
      width,
      angle,
      "BLUE",
      speed,
      800
    ))
  } else if (player1.tipoArma == 2) {
    let width = 20
    let speed = 20
    player1.velocidadDeDisparo = 500

    disparos.push(new Disparo(
      posx,
      posy,
      width,
      angle,
      "RED",
      speed,
      1600
    ));
    socket.emit("shoot", new Disparo(
      posx,
      posy,
      width,
      angle,
      "BLUE",
      speed,
      1600
    ));
  }

}

let disparando = false;  // Cambié a false para representar el estado de no estar disparando
let intervalId


const dispararOnMove = (e) => {
  if (disparando) {
    clearInterval(intervalId);
    disparar(e);
    disparando = false
    intervalId = setInterval(() => {
      disparando = true
    }, player1.velocidadDeDisparo);
  }
};

const rafaga = () => {
  disparando = true;
  if (!intervalId) {
    intervalId = setInterval(() => disparar(), player1.velocidadDeDisparo);
  }
};

const rafagaStop = () => {
  disparando = false;
  clearInterval(intervalId);
  intervalId = null; // Reinicia el ID del intervalo
};



canva.addEventListener("mousedown", rafaga);
canva.addEventListener("mouseup", rafagaStop);
canva.addEventListener("mousemove", dispararOnMove);
canva.addEventListener("mouseout", rafagaStop)

setInterval(() => {
  clear();
  player1.update();
  socket.emit("move", { ...player1, playerNumber: playerNumber });

  player2.update();

  // Actualizar y dibujar todos los disparos
  disparos.forEach((disparo, index) => {
    disparo.update();
    if (disparo.color == "BLUE" &&
      (disparo.x > player1.x || disparo.x + disparo.width > player1.x) &&
      (disparo.x < player1.x + player1.width || disparo.x + disparo.width < player1.x + player1.width) &&
      (disparo.y > player1.y || disparo.y + disparo.height > player1.y) &&
      (disparo.y < player1.y + player1.height || disparo.y + disparo.height < player1.y + player1.height) &&
      !disparo.hit
    ) {
      disparo.hit = true
      player1.health -= 1
      if (player1.health == 0) {
        socket.emit("death", player1.health)
        canva.removeEventListener("click", disparar)
      }
    }
    // Eliminar disparo si ha alcanzado su destino
    if (disparo.distanceTraveled > disparo.maxDistance) {
      // console.log(disparo.distanceTraveled)
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
      e.width,
      e.angle,
      e.color,
      e.speed,
      e.maxDistance
    )
  );
});
socket.on("move", (e) => {
  player2.x = e.x;
  player2.y = e.y;
});
socket.on("death", e => {
  player2.health = 0
})