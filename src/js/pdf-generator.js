/**
 * PDF Generator for Bear Snake Game
 * Uses jsPDF to create a PDF with embedded JavaScript for the game
 */

function generateBearSnakePDF() {
  try {
    // Load dependencies
    if (typeof jspdf === 'undefined') {
      throw new Error('jsPDF library is required!');
    }
    
    const { jsPDF } = window.jspdf;
    
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title and decorative elements
    doc.setFillColor(139, 69, 19); // #8B4513 (brown)
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Bear Snake Game', 105, 13, { align: 'center' });
    
    // Add instructions
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Instructions:', 20, 35);
    
    doc.setFontSize(12);
    const instructions = [
      '1. Use arrow keys or on-screen controls to navigate the bear',
      '2. Collect red food to grow and earn 10 points',
      '3. Special gold food appears occasionally for 50 bonus points',
      '4. Avoid hitting the walls or the bear\'s own body',
      '5. This game only works in Adobe Acrobat Reader with JavaScript enabled'
    ];
    
    let y = 45;
    instructions.forEach(instruction => {
      doc.text(instruction, 20, y);
      y += 8;
    });
    
    // Add note about Adobe Acrobat
    doc.setFillColor(255, 240, 220); // Light beige
    doc.rect(20, y, 170, 12, 'F');
    doc.setTextColor(139, 69, 19); // Brown
    doc.text('Note: Open this PDF in Adobe Acrobat Reader with JavaScript enabled', 25, y + 8);
    
    y += 20;
    
    // Add second page for the game
    doc.addPage();
    
    // Add title for the game page
    doc.setFillColor(139, 69, 19); // #8B4513 (brown)
    doc.rect(0, 0, 210, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Bear Snake Game', 105, 10, { align: 'center' });
    
    // Embed Bear Snake game JavaScript
    // First get the game code from our HTML file
    const gameCode = document.getElementById('bear-snake-code').textContent;
    
    // Create a script that will run when the PDF is opened
    const initScript = `
      // Create HTML elements for the game
      var gameContainer = document.createElement('div');
      gameContainer.innerHTML = '${createGameHTML().replace(/'/g, "\\'")}';
      document.body.appendChild(gameContainer);
      
      // Add the game code
      ${gameCode}
    `;
    
    // Set JavaScript to run when the PDF is opened
    doc.setJavaScript(initScript);
    
    // Add play area placeholder
    doc.setDrawColor(205, 133, 63); // #CD853F (medium brown)
    doc.setLineWidth(1);
    doc.rect(30, 25, 150, 200);
    
    doc.setTextColor(139, 69, 19); // Brown
    doc.setFontSize(14);
    doc.text('Game Area', 105, 125, { align: 'center' });
    
    // Add control hints
    doc.setFillColor(245, 222, 179); // Light wheat color
    doc.rect(30, 235, 150, 40, 'F');
    doc.setTextColor(139, 69, 19);
    doc.setFontSize(12);
    doc.text('Controls:', 35, 245);
    doc.text('↑/W = Up, ↓/S = Down, ←/A = Left, →/D = Right', 105, 255, { align: 'center' });
    doc.text('Start button begins the game, Reset button restarts', 105, 265, { align: 'center' });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Created with Claude AI • PDF Bear Snake Game', 105, 290, { align: 'center' });
    
    // Save the PDF
    return doc.output('blob');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

// Create the HTML structure for the game to be embedded in the PDF
function createGameHTML() {
  return `
    <div class="game-container">
      <div class="controls">
        <button id="startButton">Start</button>
        <button id="resetButton">Reset</button>
      </div>
      
      <div class="game-info">
        <div class="score-container">Score: <span id="score">0</span></div>
        <div id="gameMessage">Press Start to play!</div>
      </div>
      
      <canvas id="gameCanvas" width="300" height="300"></canvas>
      
      <div id="touchControls">
        <button id="upButton" class="touch-btn">↑</button>
        <button id="leftButton" class="touch-btn">←</button>
        <button id="rightButton" class="touch-btn">→</button>
        <button id="downButton" class="touch-btn">↓</button>
      </div>
    </div>
  `;
}