/**
 * https://www.youtube.com/watch?v=yP5DKzriqXA
 * 4:54:40
 */

canvas = document.querySelector("canvas");
c = canvas.getContext("2d");

const canvasWidth = 1024;
const canvasHeight = 576;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  // map width 70 tiles
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  // map width 70 tiles
  battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const mapImage = new Image();
mapImage.src = "./Images/pelletTown.png";

const foregroundImage = new Image();
foregroundImage.src = "./Images/foreground.png";

const playerImage = new Image();
playerImage.src = "./Images/playerDown.png";

const playerUpImage = new Image();
playerUpImage.src = "./Images/playerUp.png";

const playerDownImage = new Image();
playerDownImage.src = "./Images/playerDown.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./Images/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./Images/playerRight.png";

const playerSpeed = 3;

const offset = {
  x: -735,
  y: -650,
};

const playerDimensions = {
  //static value of img
  width: 192,
  height: 68,
};

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: mapImage,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

const player = new Sprite({
  position: {
    x: canvas.width / 2 - playerDimensions.width / 4 / 2,
    y: canvas.height / 2 - playerDimensions.height / 2,
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const boundaries = [];
//populate boundaries
collisionsMap.forEach((row, i) => {
  row.forEach((tile, j) => {
    if (tile === 1025) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
    }
  });
});

const battleZones = [];
//populate battleZones
battleZonesMap.forEach((row, i) => {
  row.forEach((tile, j) => {
    if (tile === 1025) {
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
    }
  });
});

const movables = [background, ...boundaries, ...battleZones, foreground];

const battle = {
  initiated: false,
};

//Variables for drawFPS()
let secondsPassed;
let oldTimeStamp;
let fps;

const drawFPS = (timeStamp) => {
  // Calculate the number of seconds passed since the last frame
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  // Calculate fps
  fps = Math.round(1 / secondsPassed);

  // Draw number to the screen
  c.font = "25px Arial";
  c.fillStyle = "black";
  c.fillText("FPS: " + fps, 10, 30);
};

const rectCollision = ({ rect1, rect2 }) => {
  return (
    rect1.position.x + rect1.width >= rect2.position.x &&
    rect1.position.x <= rect2.position.x + rect2.width &&
    rect1.position.y <= rect2.position.y + rect2.height - 24 &&
    rect1.position.y + rect1.height >= rect2.position.y
  );
};

const drawBoundaries = () => {
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
};

const drawBattleZones = () => {
  battleZones.forEach((tile) => {
    tile.draw();
  });
};

const update = (animationId) => {
  let canMove = true;
  player.animate = false;

  if (battle.initiated) return;

  //if moving check battlezone collision ACTIVATE BATTLE
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y));
      if (
        rectCollision({
          rect1: player,
          rect2: battleZone,
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        console.log("ACTIVATE BATTLE");
        //deactivate current animation loop
        this.cancelAnimationFrame(animationId);
        //battleActivationAnimation
        gsap.to("#overlappingDiv", {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                //activate a new animation loop
                battleLoop();
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                  duration: 0.4,
                });
              }
            });
            
          },
        });
        battle.initiated = true;
        break;
      }
    }
  }

  if (keys.w.pressed && lastKey === "w") {
    player.animate = true;
    player.image = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              //create clone
              x: boundary.position.x,
              y: boundary.position.y + playerSpeed, //detect future
            },
          },
        })
      ) {
        canMove = false;
        break;
      }
    }
    if (canMove)
      movables.forEach((movable) => {
        movable.position.y += playerSpeed;
      });
  } else if (keys.a.pressed && lastKey === "a") {
    player.animate = true;
    player.image = player.sprites.left;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              //create clone
              x: boundary.position.x + playerSpeed, //detect future
              y: boundary.position.y,
            },
          },
        })
      ) {
        canMove = false;
        break;
      }
    }
    if (canMove)
      movables.forEach((movable) => {
        movable.position.x += playerSpeed;
      });
  } else if (keys.s.pressed && lastKey === "s") {
    player.animate = true;
    player.image = player.sprites.down;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              //create clone
              x: boundary.position.x,
              y: boundary.position.y - playerSpeed, //detect future
            },
          },
        })
      ) {
        canMove = false;
        break;
      }
    }
    if (canMove)
      movables.forEach((movable) => {
        movable.position.y -= playerSpeed;
      });
  } else if (keys.d.pressed && lastKey === "d") {
    player.animate = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              //create clone
              x: boundary.position.x - playerSpeed, //detect future
              y: boundary.position.y,
            },
          },
        })
      ) {
        canMove = false;
        break;
      }
    }
    if (canMove)
      movables.forEach((movable) => {
        movable.position.x -= playerSpeed;
      });
  }
};

const showFPS = true;
const showBoundaries = true;
const showBattleZones = true;

const gameLoop = (timeStamp) => {
  // Keep requesting new frames
  const animationId = this.requestAnimationFrame(gameLoop);

  update(animationId);
  background.draw();
  if (showBoundaries) drawBoundaries();
  if (showBattleZones) drawBattleZones();
  if (showFPS) drawFPS(timeStamp);
  player.draw();
  foreground.draw();
};

// start game
//gameLoop();

const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./Images/battleBackground.png";
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

const draggleImage = new Image();
draggleImage.src = "./Images/draggleSprite.png";
const draggle = new Sprite({
  position: {
    x: 800,
    y: 100
  },
  image: draggleImage,
  frames: {
    max: 4,
    hold: 30
  },
  animate: true
})

const embyImage = new Image();
embyImage.src = "./Images/embySprite.png";
const emby = new Sprite({
  position: {
    x: 285,
    y: 325
  },
  image: embyImage,
  frames: {
    max: 4,
    hold: 30
  },
  animate: true
})

const battleLoop = (timeStamp) => {
  this.requestAnimationFrame(battleLoop);
  battleBackground.draw()
  draggle.draw()
  emby.draw()

  if (showFPS) drawFPS(timeStamp);
};

battleLoop()

//doesnt work if capslock on
let lastKey = "";
this.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
  //console.log(keys);
});

this.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
