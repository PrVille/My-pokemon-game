canvas = document.querySelector('canvas')
c = canvas.getContext('2d')
    
const canvasWidth = 1024
const canvasHeight = 576

canvas.width = canvasWidth
canvas.height = canvasHeight

console.log("hey");


const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) { // map width 70 tiles
  collisionsMap.push(collisions.slice(i, 70 + i))
}

const mapImage = new Image()
mapImage.src = './Images/pelletTown.png'

const foregroundImage = new Image()
foregroundImage.src = './Images/foreground.png'

const playerImage = new Image()
playerImage.src = './Images/playerDown.png'

const playerSpeed = 5

const offset = {
  x: -735,
  y: -650
}

const playerDimensions = { //static value of img
  width: 192, 
  height: 68 
}

const background = new Sprite({ 
  position: {
    x: offset.x,
    y: offset.y
  },
  image: mapImage
})

const foreground = new Sprite({ 
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const player = new Sprite({ 
  position: {
    x: canvas.width / 2 - (playerDimensions.width / 4) / 2, 
    y: canvas.height / 2 - playerDimensions.height / 2
  },
  image: playerImage,
  frames: {
    max: 4
  }
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const boundaries = []
//populate boundaries
collisionsMap.forEach((row, i) => {
  row.forEach((tile, j) => {
    if (tile === 1025) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y    
          }
        })
      )
    }
  })
})

const movables = [background, ...boundaries, foreground]

//Variables for drawFPS()
let secondsPassed
let oldTimeStamp
let fps

const drawFPS = (timeStamp) => {
    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp

    // Calculate fps
    fps = Math.round(1 / secondsPassed)

    // Draw number to the screen
    c.font = '25px Arial'
    c.fillStyle = 'black'
    c.fillText("FPS: " + fps, 10, 30)

}

const rectCollision = ({ rect1, rect2 }) => {  
  return (
    rect1.position.x + rect1.width >= rect2.position.x &&
    rect1.position.x <= rect2.position.x + rect2.width &&
    rect1.position.y <= rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height >= rect2.position.y
  )
}

const drawBoundaries = () => {
  boundaries.forEach(boundary => {
    boundary.draw()
  })
}

const update = () => {
  let canMove = true

  if (keys.w.pressed && lastKey === 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectCollision({
        rect1: player, 
        rect2: {...boundary, position: { //create clone
          x: boundary.position.x,
          y: boundary.position.y + playerSpeed //detect future
          }} 
      })) {
        console.log('collision');
        canMove = false
        break
      }
    }
    if (canMove) movables.forEach(movable => {movable.position.y += playerSpeed})
  } else if (keys.a.pressed && lastKey === 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectCollision({
        rect1: player, 
        rect2: {...boundary, position: { //create clone
          x: boundary.position.x + playerSpeed, //detect future
          y: boundary.position.y 
          }} 
      })) {
        console.log('collision');
        canMove = false
        break
      }
    }
    if (canMove) movables.forEach(movable => {movable.position.x += playerSpeed})
  } else if (keys.s.pressed && lastKey === 's') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectCollision({
        rect1: player, 
        rect2: {...boundary, position: { //create clone
          x: boundary.position.x,
          y: boundary.position.y - playerSpeed //detect future
          }} 
      })) {
        console.log('collision');
        canMove = false
        break
      }
    }
    if (canMove) movables.forEach(movable => {movable.position.y -= playerSpeed})
  } else if (keys.d.pressed && lastKey === 'd') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectCollision({
        rect1: player, 
        rect2: {...boundary, position: { //create clone
          x: boundary.position.x - playerSpeed, //detect future
          y: boundary.position.y 
          }} 
      })) {
        console.log('collision');
        canMove = false
        break
      }
    }
    if (canMove) movables.forEach(movable => {movable.position.x -= playerSpeed})
  } 
}

const showFPS = true
const showBoundaries = true

const gameLoop = (timeStamp) => {
    update();
    background.draw()
    if (showBoundaries) drawBoundaries()
    if (showFPS) drawFPS(timeStamp)
    player.draw()
    foreground.draw()
    // Keep requesting new frames
    requestAnimationFrame(gameLoop)
}

//doesnt work if capslock on
let lastKey = ''
this.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true  
      lastKey = 'w'  
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a' 
      break
    case 's':
      keys.s.pressed = true
      lastKey = 's' 
      break
    case 'd':
      keys.d.pressed = true
      lastKey = 'd' 
      break
  }
  //console.log(keys);
  
})

this.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

// start game
gameLoop()

