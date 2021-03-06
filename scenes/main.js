const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 470
let CURRENT_JUMP_FORCE = JUMP_FORCE
const ENEMY_SPEED = 50
let isJumping = true
const FALL_DEATH = 600

layer(['obj', 'ui'], 'obj')


const map1 = [
'                                  ',
'                                  ',
'                                  ',
'                                  ',
'                                  ',
'    %    =*=%=                    ',
'                                  ',
'                                  ',
'                        -+        ',
'              ^    ^    ()        ',
'xxxxxxxxxxxxxxxxxxxxxxxxxx    xxxx',
]


const map2 = [
'€                                €',
'€                                €',
'€                                €',
'€                                €',
'€       778777          s        €',
'€                     s s        €',
'€                   s s s s    -+€',
'€            !    s s s s s s  ()€',
'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
]




const maps = [map1,map2]


const levelConfig = {
  width: 20,
  height: 20,
  // for level 1
  'x': [sprite('BrownWall'), solid()],
  '=': [sprite('Block'), solid()],
  '$': [sprite('Coin'), 'coin'],
  '%': [sprite('QuestionMark'), 'coin-surprise',solid()],
  '*': [sprite('QuestionMark'), 'mushroom-surprise', solid()],
  '}': [sprite('EmptyBlock'),  solid()],
  '(': [sprite('pipe-left'), scale(0.5), solid()],
  ')': [sprite('pipe-right'), scale(0.5), solid()],
  '-': [sprite('pipe-top-left-side'), scale(0.5), solid(), 'pipe'],
  '+': [sprite('pipe-top-right-side'), scale(0.5), solid(), 'pipe'],
  '^': [sprite('Enemy'), 'dangerous'],
  '#': [sprite('PowerUp'), 'mushroom', body()],
  // for level 2
  '€': [sprite('BlueBlock'), solid(), scale(0.5)],
  'z': [sprite('BlueWall'), solid(), scale(0.5)],
  '@': [sprite('BlueBlock'), solid(), scale(0.5)],
  '!': [sprite('BlueEnemy'), 'dangerous', scale(0.5)],
  's': [sprite('Blue2'), solid(), scale(0.5)],
  '7': [sprite('BlueMystery'), solid(), scale(0.5), 'coin-surprise'],
  '8': [sprite('BlueMystery'), solid(), scale(0.5), 'mushroom-surprise']

}


const levelIndex = args.level ?? 0
const gameLevel = addLevel(maps[levelIndex], levelConfig)



const scoreGlobal = args.score ?? 0
// adding score
const scoreLabel = add([
  text(scoreGlobal),
  pos(30,6),
  layer('ui'),
  {
    value: scoreGlobal,
  }
])

// Adding text for level number
add([
  text('Level ' + parseInt(levelIndex + 1) ),
  pos(40,6),
])

// making the mario bigger or smaller
function big() {
  let timer = 0
  let isBig = false
  return {
    update() {
      if(isBig){
        timer -= dt()
        if(timer <= 0){
          this.smallify()
        }
      }
    },
    isBig() {
      return isBig
    }, 
    smallify() {
      this.scale = vec2(1)
      timer = 0
      isBig = false
      CURRENT_JUMP_FORCE = JUMP_FORCE
    }, 
    biggify(time) {
      this.scale = vec2(2)
      timer = time
      isBig = true
      CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
    }
  }
}


// adding mario sprite
const player = add([
  sprite('MarioStanding'),
  pos(30,0),
  body(),
  big(),
  origin('bot')
])


// if the mario collides with enemy, it dies
player.collides('dangerous', (d) => {
  if(isJumping){
    destroy(d)
  }else {
    go('lose', {score: scoreLabel.value})
  }
})



// Making the camera follow the player position
player.action(() => {
  camPos(player.pos)
  if(player.pos.y >= FALL_DEATH){
    go('lose', {score: scoreLabel.value})
  }
})


//making the mario move left
keyDown('left', ()=>{
  player.move(-MOVE_SPEED, 0)
})

//making the mario move right
keyDown('right', ()=>{
  player.move(MOVE_SPEED, 0)
})

// making the mario kill the enemy if it is in air
player.action(() => {
  if(player.grounded()){
    isJumping = false
  }
})


//making the mario jump
keyDown('space', ()=>{
  // only jump if the mario is at the ground
  if(player.grounded()){
    isJumping = true
    player.jump(CURRENT_JUMP_FORCE)
  }
})

// getting things out of surprise blocks, and then replacing them by empty boxes
player.on('headbump',  (obj) => {
  if(obj.is('coin-surprise')){
    gameLevel.spawn('$', obj.gridPos.sub(0,1))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0,0))
  }
  if(obj.is('mushroom-surprise')){
  gameLevel.spawn('#', obj.gridPos.sub(0,1))
  destroy(obj)
  gameLevel.spawn('}', obj.gridPos.sub(0,0))
  }
})


// making the mushroom move
action('mushroom', (m) => {
  m.move(20, 0)
})


// if player collides with power up mushroom, scale the player up
player.collides('mushroom', (m) => {
  player.biggify(6)
  destroy(m)
})



// if player collides with coin, destroy coin, increment score
player.collides('coin', (c) => {
  destroy(c)
  scoreLabel.value++
  scoreLabel.text = scoreLabel.value
})


// .. making the enemies move
action('dangerous', (d) => {
  d.move(-ENEMY_SPEED,0)
})

player.collides('pipe',  () => {
  keyPress('down', () => {
    go('main', {
      level: (levelIndex + 1) % maps.length,
      score: scoreLabel.value
    })
  })
})

