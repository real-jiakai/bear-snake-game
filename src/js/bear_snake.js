/**
 * Bear Snake Game
 * 
 * A variation of the classic Snake game with a bear theme.
 */

// Game constants
const CELL_SIZE = 15;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;
const GAME_SPEED = 150; // ms between updates

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
    gameLoop = setInterval(updateGame, GAME_SPEED);
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
  
  // Clear canvas
  ctx.fillStyle = '#f0f0f0';
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
  
  // Draw food (red apple)
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(
    food.x * cellWidth, 
    food.y * cellHeight, 
    cellWidth, 
    cellHeight
  );
  
  // Draw bonus food (gold)
  if (bonusActive) {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(
      bonusFood.x * cellWidth, 
      bonusFood.y * cellHeight, 
      cellWidth, 
      cellHeight
    );
  }
  
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
}

// Initialize the game when loaded
if (document.readyState === 'complete') {
  initGame();
} else {
  window.addEventListener('load', initGame);
}