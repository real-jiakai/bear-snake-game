/**
 * Bear Snake Game
 * 
 * A variation of the classic Snake game with a bear theme.
 */

// Game constants
const CELL_SIZE = 15;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;
const INITIAL_GAME_SPEED = 150; // ms between updates
let currentGameSpeed = INITIAL_GAME_SPEED;

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Particle system for visual effects
function createParticle(x, y, color, speed = 2, life = 30) {
  return {
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    color: color,
    life: life,
    maxLife: life,
    size: Math.random() * 4 + 2
  };
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
    
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles(ctx) {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Power-up system
function createPowerUp(x, y, type) {
  return {
    x: x,
    y: y,
    type: type, // 'slow', 'score'
    lifetime: 200, // How long it stays on screen
    pulse: 0
  };
}

function updatePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].lifetime--;
    powerUps[i].pulse += 0.2;
    if (powerUps[i].lifetime <= 0) {
      powerUps.splice(i, 1);
    }
  }
  
  // Update slow motion effect
  if (slowMotionActive) {
    slowMotionTimer--;
    if (slowMotionTimer <= 0) {
      slowMotionActive = false;
    }
  }
}

function generatePowerUp() {
  if (powerUps.length < 1 && Math.random() < 0.1) { // 10% chance
    let validPosition = false;
    let x, y;
    
    while (!validPosition) {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
      
      validPosition = true;
      // Check if position is occupied by snake
      for (let segment of snake) {
        if (segment.x === x && segment.y === y) {
          validPosition = false;
          break;
        }
      }
      
      // Check if position is occupied by food
      if ((food.x === x && food.y === y) || 
          (bonusActive && bonusFood.x === x && bonusFood.y === y)) {
        validPosition = false;
      }
    }
    
    const powerUpType = Math.random() < 0.5 ? 'slow' : 'score';
    powerUps.push(createPowerUp(x, y, powerUpType));
  }
}

// Game variables
let snake = [
  { x: 15, y: 15 },
  { x: 14, y: 15 },
  { x: 13, y: 15 }
]; // Bear body, starting with head and two segments
let direction = { x: 1, y: 0 }; // Starting direction: right
let food = { x: 20, y: 15 };
let bonusFood = { x: -1, y: -1 }; // Off screen initially
let bonusActive = false;
let bonusTimer = 0;
let score = 0;
let gameActive = false;
let gameLoop;
let lastDirection = { x: 1, y: 0 };
let particles = [];
let gameTime = 0;
let powerUps = [];
let slowMotionActive = false;
let slowMotionTimer = 0;

// Initialize game
function initGame() {
  // Set up initial game state
  resetGame();
  
  // Set up event listeners for keyboard controls
  document.addEventListener('keydown', handleKeyPress);
  
  // Add event listeners for direction buttons
  document.getElementById('upButton').addEventListener('click', () => changeDirection(0, -1));
  document.getElementById('leftButton').addEventListener('click', () => changeDirection(-1, 0));
  document.getElementById('rightButton').addEventListener('click', () => changeDirection(1, 0));
  document.getElementById('downButton').addEventListener('click', () => changeDirection(0, 1));
  
  // Add event listeners for game buttons
  document.getElementById('startButton').addEventListener('click', startGame);
  document.getElementById('resetButton').addEventListener('click', resetGame);
  
  // Draw initial state
  drawGame();
}

// Reset game to initial state
function resetGame() {
  snake = [
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 }
  ];
  direction = { x: 1, y: 0 };
  lastDirection = { x: 1, y: 0 };
  score = 0;
  gameActive = false;
  bonusActive = false;
  bonusFood = { x: -1, y: -1 };
  particles = [];
  gameTime = 0;
  currentGameSpeed = INITIAL_GAME_SPEED;
  powerUps = [];
  slowMotionActive = false;
  slowMotionTimer = 0;
  
  generateFood();
  updateScore();
  
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  
  document.getElementById('gameMessage').textContent = 'Press Start to play!';
  drawGame();
}

// Start the game
function startGame() {
  if (!gameActive) {
    gameActive = true;
    document.getElementById('gameMessage').textContent = 'Game running...';
    gameLoop = setInterval(updateGame, currentGameSpeed);
  }
}

function updateGameSpeed() {
  // Increase speed every 50 points, but cap the minimum speed
  let baseSpeed = Math.max(80, INITIAL_GAME_SPEED - Math.floor(score / 50) * 10);
  
  // Apply slow motion effect
  if (slowMotionActive) {
    baseSpeed = Math.floor(baseSpeed * 1.5); // 50% slower
  }
  
  if (baseSpeed !== currentGameSpeed) {
    currentGameSpeed = baseSpeed;
    if (gameActive) {
      clearInterval(gameLoop);
      gameLoop = setInterval(updateGame, currentGameSpeed);
    }
  }
}

// Handle keyboard input
function handleKeyPress(e) {
  if (!gameActive) return;
  
  // Prevent default behavior for arrow keys and WASD to avoid page scrolling
  if ([37, 38, 39, 40, 65, 68, 83, 87].includes(e.keyCode)) {
    e.preventDefault();
  }
  
  switch (e.keyCode) {
    // Left Arrow or A
    case 37:
    case 65:
      changeDirection(-1, 0);
      break;
    // Up Arrow or W
    case 38:
    case 87:
      changeDirection(0, -1);
      break;
    // Right Arrow or D  
    case 39:
    case 68:
      changeDirection(1, 0);
      break;
    // Down Arrow or S
    case 40:
    case 83:
      changeDirection(0, 1);
      break;
  }
}

// Change the bear's direction, preventing 180-degree turns
function changeDirection(x, y) {
  // Prevent 180-degree turns (can't go directly backwards)
  if ((lastDirection.x === -x && x !== 0) || (lastDirection.y === -y && y !== 0)) {
    return;
  }
  
  direction = { x, y };
}

// Main game update loop
function updateGame() {
  if (!gameActive) return;
  
  gameTime++;
  updateParticles();
  updatePowerUps();
  generatePowerUp();
  
  // Save the current direction as last direction
  lastDirection = { x: direction.x, y: direction.y };
  
  // Calculate new head position
  const head = { 
    x: snake[0].x + direction.x, 
    y: snake[0].y + direction.y 
  };
  
  // Check for collisions
  if (isCollision(head)) {
    gameOver();
    return;
  }
  
  // Add new head
  snake.unshift(head);
  
  // Handle food collection
  let foodEaten = false;
  
  // Check if regular food was eaten
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
    foodEaten = true;
    playSound(440, 0.2, 'square'); // Food eaten sound
    
    // Create particles for food collection
    const canvas = document.getElementById('gameCanvas');
    const cellWidth = canvas.width / GRID_WIDTH;
    const cellHeight = canvas.height / GRID_HEIGHT;
    for (let i = 0; i < 8; i++) {
      particles.push(createParticle(
        head.x * cellWidth + cellWidth/2,
        head.y * cellHeight + cellHeight/2,
        '#ff4444',
        4,
        20
      ));
    }
    
    updateGameSpeed(); // Increase difficulty
    
    // 20% chance to spawn bonus food when eating regular food
    if (Math.random() < 0.2 && !bonusActive) {
      generateBonusFood();
    }
  }
  
  // Check if bonus food was eaten
  if (bonusActive && head.x === bonusFood.x && head.y === bonusFood.y) {
    score += 50;
    bonusActive = false;
    bonusFood = { x: -1, y: -1 };
    foodEaten = true;
    playSound(660, 0.3, 'triangle'); // Bonus food sound
    
    // Create golden particles for bonus food
    const canvas = document.getElementById('gameCanvas');
    const cellWidth = canvas.width / GRID_WIDTH;
    const cellHeight = canvas.height / GRID_HEIGHT;
    for (let i = 0; i < 15; i++) {
      particles.push(createParticle(
        head.x * cellWidth + cellWidth/2,
        head.y * cellHeight + cellHeight/2,
        '#ffd700',
        6,
        40
      ));
    }
  }
  
  // Check power-up collection
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    if (head.x === powerUp.x && head.y === powerUp.y) {
      // Apply power-up effect
      if (powerUp.type === 'slow') {
        slowMotionActive = true;
        slowMotionTimer = 100; // Lasts for 100 game ticks
        playSound(330, 0.4, 'sine');
      } else if (powerUp.type === 'score') {
        score += 25;
        playSound(550, 0.3, 'triangle');
      }
      
      // Create power-up particles
      const canvas = document.getElementById('gameCanvas');
      const cellWidth = canvas.width / GRID_WIDTH;
      const cellHeight = canvas.height / GRID_HEIGHT;
      for (let j = 0; j < 10; j++) {
        particles.push(createParticle(
          head.x * cellWidth + cellWidth/2,
          head.y * cellHeight + cellHeight/2,
          powerUp.type === 'slow' ? '#00ffff' : '#ff00ff',
          5,
          25
        ));
      }
      
      powerUps.splice(i, 1);
      updateGameSpeed(); // Update speed in case slow motion was activated
    }
  }
  
  // Remove tail if no food was eaten
  if (!foodEaten) {
    snake.pop();
  }
  
  // Update bonus food timer
  if (bonusActive) {
    bonusTimer--;
    if (bonusTimer <= 0) {
      bonusActive = false;
      bonusFood = { x: -1, y: -1 };
    }
  }
  
  updateScore();
  drawGame();
}

// Check for collisions with walls or self
function isCollision(position) {
  // Wall collision
  if (
    position.x < 0 || 
    position.y < 0 || 
    position.x >= GRID_WIDTH || 
    position.y >= GRID_HEIGHT
  ) {
    return true;
  }
  
  // Self collision (check if position exists in snake body)
  // Skip the head since we're checking the new position
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === position.x && snake[i].y === position.y) {
      return true;
    }
  }
  
  return false;
}

// Generate food at random position
function generateFood() {
  // Keep generating until we find a position not occupied by the snake
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT)
    };
    
    valid = true;
    // Check if food is on the snake
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === food.x && snake[i].y === food.y) {
        valid = false;
        break;
      }
    }
    
    // Check it's not on the bonus food
    if (bonusActive && food.x === bonusFood.x && food.y === bonusFood.y) {
      valid = false;
    }
  }
}

// Generate bonus food at random position
function generateBonusFood() {
  // Keep generating until we find a position not occupied by the snake or regular food
  let valid = false;
  while (!valid) {
    bonusFood = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT)
    };
    
    valid = true;
    // Check if bonus food is on the snake
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === bonusFood.x && snake[i].y === bonusFood.y) {
        valid = false;
        break;
      }
    }
    
    // Check it's not on the regular food
    if (bonusFood.x === food.x && bonusFood.y === food.y) {
      valid = false;
    }
  }
  
  bonusActive = true;
  bonusTimer = 50; // Bonus will disappear after about 50 game ticks
}

// Draw game state
function drawGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with animated background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const time = gameTime * 0.05;
  gradient.addColorStop(0, `hsl(${120 + Math.sin(time) * 30}, 20%, 95%)`);
  gradient.addColorStop(1, `hsl(${150 + Math.cos(time) * 20}, 25%, 90%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate cell size based on canvas dimensions to fill the entire canvas
  const cellWidth = canvas.width / GRID_WIDTH;
  const cellHeight = canvas.height / GRID_HEIGHT;
  
  // Draw grid (optional)
  ctx.strokeStyle = '#e0e0e0';
  for (let i = 0; i <= GRID_WIDTH; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= GRID_HEIGHT; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellHeight);
    ctx.lineTo(canvas.width, i * cellHeight);
    ctx.stroke();
  }
  
  // Draw food (animated red apple)
  const foodPulse = Math.sin(gameTime * 0.2) * 0.1 + 1;
  ctx.fillStyle = '#ff0000';
  const foodSize = Math.min(cellWidth, cellHeight) * foodPulse;
  const foodOffset = (Math.min(cellWidth, cellHeight) - foodSize) / 2;
  ctx.fillRect(
    food.x * cellWidth + foodOffset, 
    food.y * cellHeight + foodOffset, 
    foodSize, 
    foodSize
  );
  
  // Draw bonus food (animated gold)
  if (bonusActive) {
    const bonusPulse = Math.sin(gameTime * 0.4) * 0.2 + 1;
    const bonusGlow = Math.sin(gameTime * 0.3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 215, 0, ${bonusGlow})`;
    const bonusSize = Math.min(cellWidth, cellHeight) * bonusPulse;
    const bonusOffset = (Math.min(cellWidth, cellHeight) - bonusSize) / 2;
    ctx.fillRect(
      bonusFood.x * cellWidth + bonusOffset, 
      bonusFood.y * cellHeight + bonusOffset, 
      bonusSize, 
      bonusSize
    );
  }
  
  // Draw power-ups
  powerUps.forEach(powerUp => {
    const pulse = Math.sin(powerUp.pulse) * 0.2 + 0.8;
    const size = Math.min(cellWidth, cellHeight) * pulse;
    const offset = (Math.min(cellWidth, cellHeight) - size) / 2;
    
    if (powerUp.type === 'slow') {
      ctx.fillStyle = '#00ffff';
    } else if (powerUp.type === 'score') {
      ctx.fillStyle = '#ff00ff';
    }
    
    ctx.fillRect(
      powerUp.x * cellWidth + offset,
      powerUp.y * cellHeight + offset,
      size,
      size
    );
    
    // Add a glowing effect
    ctx.strokeStyle = powerUp.type === 'slow' ? '#66ffff' : '#ff66ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      powerUp.x * cellWidth + offset,
      powerUp.y * cellHeight + offset,
      size,
      size
    );
  });
  
  // Draw bear (snake)
  snake.forEach((segment, index) => {
    // Head is brown, body is light brown
    ctx.fillStyle = index === 0 ? '#8B4513' : '#CD853F';
    ctx.fillRect(
      segment.x * cellWidth, 
      segment.y * cellHeight, 
      cellWidth, 
      cellHeight
    );
    
    // Add a border to each segment
    ctx.strokeStyle = '#5D2E0D';
    ctx.strokeRect(
      segment.x * cellWidth, 
      segment.y * cellHeight, 
      cellWidth, 
      cellHeight
    );
    
    // Add bear features to the head
    if (index === 0) {
      // Eyes
      ctx.fillStyle = '#000000';
      
      // Position eyes based on direction
      let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
      
      if (direction.x === 1) { // facing right
        leftEyeX = segment.x * cellWidth + cellWidth * 0.7;
        leftEyeY = segment.y * cellHeight + cellHeight * 0.3;
        rightEyeX = segment.x * cellWidth + cellWidth * 0.7;
        rightEyeY = segment.y * cellHeight + cellHeight * 0.7;
      } else if (direction.x === -1) { // facing left
        leftEyeX = segment.x * cellWidth + cellWidth * 0.3;
        leftEyeY = segment.y * cellHeight + cellHeight * 0.3;
        rightEyeX = segment.x * cellWidth + cellWidth * 0.3;
        rightEyeY = segment.y * cellHeight + cellHeight * 0.7;
      } else if (direction.y === -1) { // facing up
        leftEyeX = segment.x * cellWidth + cellWidth * 0.3;
        leftEyeY = segment.y * cellHeight + cellHeight * 0.3;
        rightEyeX = segment.x * cellWidth + cellWidth * 0.7;
        rightEyeY = segment.y * cellHeight + cellHeight * 0.3;
      } else { // facing down
        leftEyeX = segment.x * cellWidth + cellWidth * 0.3;
        leftEyeY = segment.y * cellHeight + cellHeight * 0.7;
        rightEyeX = segment.x * cellWidth + cellWidth * 0.7;
        rightEyeY = segment.y * cellHeight + cellHeight * 0.7;
      }
      
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, cellWidth * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, cellWidth * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Draw particles
  drawParticles(ctx);
  
  // Draw slow motion indicator
  if (slowMotionActive) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SLOW MOTION', canvas.width / 2, 30);
    ctx.textAlign = 'left';
  }
}

// Update score display
function updateScore() {
  document.getElementById('score').textContent = score;
}

// Game over
function gameOver() {
  gameActive = false;
  clearInterval(gameLoop);
  document.getElementById('gameMessage').textContent = 'Game Over! Press Reset to try again.';
  playSound(220, 0.8, 'sawtooth'); // Game over sound
}

// Initialize the game when loaded
if (document.readyState === 'complete') {
  initGame();
} else {
  window.addEventListener('load', initGame);
}