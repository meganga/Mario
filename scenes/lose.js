// displaying the message game over
add([
  text('Game Over'),
  scale(5),
  origin('center'),
  pos(width() / 2, height() / 3),
])

// displaying the score
add([
  text(args.score),
  scale(3),
  origin('center'),
  pos(width() / 2, height() / 2),
])