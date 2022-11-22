const battleBackgroundImage = new Image()
battleBackgroundImage.src = "./Images/battleBackground.png"
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
})

let draggle
let emby
let renderedSprites
let battleLoopId
let queue

const initBattle = () => {
  //reset previous UI and battle
  document.querySelector("#userInterface").style.display = "block"
  document.querySelector("#dialogueBox").style.display = "none"
  document.querySelector("#enemyHealthBar").style.width = "100%"
  document.querySelector("#playerHealthBar").style.width = "100%"
  document.querySelector("#attacksBox").replaceChildren()

  //new battle
  draggle = new Monster(monsters.Draggle)
  emby = new Monster(monsters.Emby)
  renderedSprites = [draggle, emby]
  queue = []

  emby.attacks.forEach((attack) => {
    const button = document.createElement("button")
    button.innerHTML = attack.name
    document.querySelector("#attacksBox").append(button)
  })

  const endBattle = () => {
    queue.push(() => {
      //fade to black
      gsap.to("#overlappingDiv", {
        opacity: 1,
        onComplete: () => {
          cancelAnimationFrame(battleLoopId)
          gameLoop()
          document.querySelector("#userInterface").style.display = "none"
          gsap.to("#overlappingDiv", {
            opacity: 0,
          })
          battle.initiated = false
          audio.map.play()
        },
      })
    })
  }

  //attack buttons
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]

      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites,
      })

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        endBattle()
      }
      //enemy attack
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites,
        })

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })
          endBattle()
        }
      })
    })

    button.addEventListener("mouseenter", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector("#attackType").innerHTML = selectedAttack.type
      document.querySelector("#attackType").style.color = selectedAttack.color
    })

    button.addEventListener("mouseleave", () => {
      document.querySelector("#attackType").innerHTML = "Attack Type"
      document.querySelector("#attackType").style.color = "black"
    })
  })
}

const battleLoop = (timeStamp) => {
  battleLoopId = this.requestAnimationFrame(battleLoop)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
  if (showFPS) drawFPS(timeStamp)
}

//start battle
//initBattle()
//battleLoop()

//EVENT LISTENERS
document.querySelector("#dialogueBox").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = "none"
})
