const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.2;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: './img/background.png',
});

const shop = new Sprite({
  position: {
    x: 620,
    y: 147,
  },
  imageSrc: './img/shop.png',
  scale: 2.6,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 50,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: './img/samuraiMack/idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/idle.png',
      framesMax: 8,
    },
    run: {
      imageSrc: './img/samuraiMack/run.png',
      framesMax: 8,
    },
    jump: {
      imageSrc: './img/samuraiMack/jump.png',
      framesMax: 2,
    },
    fall: {
      imageSrc: './img/samuraiMack/fall.png',
      framesMax: 2,
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6,
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take hit - white silhouette.png',
      framesMax: 4,
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 140,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 920,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  color: 'blue',
  imageSrc: './img/kenji/idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 169,
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/idle.png',
      framesMax: 4,
    },
    run: {
      imageSrc: './img/kenji/run.png',
      framesMax: 8,
    },
    jump: {
      imageSrc: './img/kenji/jump.png',
      framesMax: 2,
    },
    fall: {
      imageSrc: './img/kenji/fall.png',
      framesMax: 2,
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4,
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3,
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -180,
      y: 50,
    },
    width: 180,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = 'rgba(255,255,255, 0.2)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -3.15;
    player.switchSprite('run');
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 3.15;
    player.switchSprite('run');
  } else {
    player.switchSprite('idle');
  }

  // Jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump');
  }
  if (player.velocity.y > 0) {
    player.switchSprite('fall');
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -3.15;
    enemy.switchSprite('run');
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 3.15;
    enemy.switchSprite('run');
  } else {
    enemy.switchSprite('idle');
  }

  // Enemy Jumping
  if (player.velocity.y < 0) {
    enemy.switchSprite('jump');
  }
  if (player.velocity.y > 0) {
    enemy.switchSprite('fall');
  }

  // Detect for collision player & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.frameCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    gsap.to('#enemyHealth', {
      width: enemy.health + '%',
    });
  }

  //if player misses
  if (player.isAttacking && player.frameCurrent === 4) {
    player.isAttacking = false;
  }

  // Detect for collision enemy
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.frameCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    gsap.to('#playerHealth', {
      width: player.health + '%',
    });
  }

  //if enemy misses
  if (enemy.isAttacking && enemy.frameCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener('keydown', event => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        break;
      case 'a':
        keys.a.pressed = true;
        player.lastKey = 'a';
        break;
      case 'w':
        player.velocity.y += -10;
        break;
      case ' ':
        player.attack();
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = 'ArrowRight';
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = 'ArrowLeft';
        break;
      case 'ArrowUp':
        enemy.velocity.y += -10;
        break;
      case 'ArrowDown':
        enemy.attack();
        break;
    }
  }
});

window.addEventListener('keyup', event => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;

    // Enemy keys
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});
