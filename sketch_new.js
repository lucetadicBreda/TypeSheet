// --- Mouse wheel/touchpad scroll resize support and feedback ---
let resizeFlashCol = -1;
let resizeFlashTimer = 0;
// Animation variables for smooth elastic movement
let animColWidths = [];
let animRowHeights = [];
let targetColWidths = [];
let targetRowHeights = [];
let animationSpeed = 0.03; // Much slower for more gradual effect
let elasticity = 4; // Much stronger elastic effect
// Pause mechanism
let animationPaused = false;
let pauseTimer = 0;
let pauseDuration = 18; // 0.3 seconds at 60fps

function mouseWheel(event) {
  let delta = event.deltaY;
  let amount = delta > 0 ? -15 : 15; // Much more dramatic size changes
  if (selectedCol >= 0) {
    targetColWidths[selectedCol] = Math.max(5, targetColWidths[selectedCol] + amount);
    colWidths[selectedCol] = targetColWidths[selectedCol];
    resizeFlashCol = selectedCol;
    resizeFlashRow = -1;
    resizeFlashTimer = 120;
    // Trigger pause
    animationPaused = true;
    pauseTimer = pauseDuration;
  } else if (selectedRow >= 0) {
    targetRowHeights[selectedRow] = Math.max(5, targetRowHeights[selectedRow] + amount);
    rowHeights[selectedRow] = targetRowHeights[selectedRow];
    resizeFlashRow = selectedRow;
    resizeFlashCol = -1;
    resizeFlashTimer = 120;
    // Trigger pause
    animationPaused = true;
    pauseTimer = pauseDuration;
  }
  return false; // Prevent page scroll
}
let cellSize = 15; // Grid squares made 15x15 pixels
let cols, rows;
let allLines = []; // Store all lines of text
let currentLine = []; // Current line being typed
let currentRow = 2;
let sizeSlider;

// Grid customization variables
let colWidths = []; // Array to store individual column widths
let rowHeights = []; // Array to store individual row heights
let selectedCol = -1; // Currently selected column
let selectedRow = -1; // Currently selected row
let defaultCellSize = 15;

// Diagonal line modes
let verticalDiagonal = false; // Toggle for vertical lines to be diagonal
let horizontalDiagonal = false; // Toggle for horizontal lines to be diagonal
let diagonalSlant = 60; // How much the lines slant (pixels)

// Buttons for diagonal controls
let verticalButton, horizontalButton, bothButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = Math.floor(width / cellSize);
  rows = Math.floor(height / cellSize);
  
  // Initialize column widths and row heights
  initializeGrid();
  
  // Create slider for grid size (adjusted for larger default)
  sizeSlider = createSlider(5, 25, 15, 1);
  sizeSlider.position(20, 20);
  sizeSlider.size(200);
  
  // Create diagonal control buttons
  verticalButton = createButton('Vertical \\');
  verticalButton.position(240, 20);
  verticalButton.size(80, 25);
  verticalButton.mousePressed(toggleVerticalDiagonal);
  
  horizontalButton = createButton('Horizontal /');
  horizontalButton.position(330, 20);
  horizontalButton.size(90, 25);
  horizontalButton.mousePressed(toggleHorizontalDiagonal);
  
  bothButton = createButton('Both');
  bothButton.position(430, 20);
  bothButton.size(60, 25);
  bothButton.mousePressed(toggleBothDiagonal);
  
  // Initialize button styles
  updateButtonStyles();
}

function initializeGrid() {
  colWidths = [];
  rowHeights = [];
  animColWidths = [];
  animRowHeights = [];
  targetColWidths = [];
  targetRowHeights = [];
  for (let i = 0; i < cols; i++) {
    colWidths[i] = defaultCellSize;
    animColWidths[i] = defaultCellSize;
    targetColWidths[i] = defaultCellSize;
  }
  for (let j = 0; j < rows; j++) {
    rowHeights[j] = defaultCellSize;
    animRowHeights[j] = defaultCellSize;
    targetRowHeights[j] = defaultCellSize;
  }
}

// Button callback functions
function toggleVerticalDiagonal() {
  console.log("Vertical button clicked! Current state:", verticalDiagonal);
  verticalDiagonal = !verticalDiagonal;
  console.log("New state:", verticalDiagonal);
  updateButtonStyles();
}

function toggleHorizontalDiagonal() {
  console.log("Horizontal button clicked! Current state:", horizontalDiagonal);
  horizontalDiagonal = !horizontalDiagonal;
  console.log("New state:", horizontalDiagonal);
  updateButtonStyles();
}

function toggleBothDiagonal() {
  console.log("Both button clicked!");
  let bothOn = verticalDiagonal && horizontalDiagonal;
  verticalDiagonal = !bothOn;
  horizontalDiagonal = !bothOn;
  console.log("New vertical state:", verticalDiagonal, "New horizontal state:", horizontalDiagonal);
  updateButtonStyles();
}

function updateButtonStyles() {
  // Update button appearance based on state
  if (verticalDiagonal) {
    verticalButton.style('background-color', '#ffcccc');
    verticalButton.html('Vertical \\ ON');
  } else {
    verticalButton.style('background-color', '#ffffff');
    verticalButton.html('Vertical \\');
  }
  
  if (horizontalDiagonal) {
    horizontalButton.style('background-color', '#ccffcc');
    horizontalButton.html('Horizontal / ON');
  } else {
    horizontalButton.style('background-color', '#ffffff');
    horizontalButton.html('Horizontal /');
  }
  
  if (verticalDiagonal && horizontalDiagonal) {
    bothButton.style('background-color', '#ccccff');
    bothButton.html('Both ON');
  } else {
    bothButton.style('background-color', '#ffffff');
    bothButton.html('Both');
  }
}

function draw() {
  background(255);
  
  // Update cell size from slider (only if slider exists and value changed)
  if (sizeSlider) {
    let newCellSize = sizeSlider.value();
    if (newCellSize !== defaultCellSize) {
      defaultCellSize = newCellSize;
      cellSize = newCellSize;
      cols = Math.floor(width / cellSize);
      rows = Math.floor(height / cellSize);
      initializeGrid();
    }
  }
  
  // Draw custom grid with variable column widths and row heights
  drawCustomGrid();
  
  // Draw all previous lines
  for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
    let line = allLines[lineIndex];
    let lineRow = 2 + lineIndex * 11; // 2 empty boxes between rows
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ') {
        drawLetter(line[i], 2 + i * 6, lineRow);
      }
    }
  }
  
  // Draw current line
  if (currentLine.length > 0) {
    for (let i = 0; i < currentLine.length; i++) {
      if (currentLine[i] !== ' ') {
        drawLetter(currentLine[i], 2 + i * 6, currentRow);
      }
    }
  }
  
  // Draw selection highlights
  drawSelectionHighlights();
  
  // Draw instructions
  fill(0);
  noStroke();
  textSize(12);
  text("Type letters | Backspace=delete | Enter=new line | Up/Down arrows=change row", 20, height - 80);
  text("Click to select column/row | +/- to resize selected | ESC to deselect", 20, height - 65);
  if (selectedCol >= 0) {
    text("Selected Column: " + selectedCol + " (Width: " + colWidths[selectedCol] + "px)", 20, height - 50);
  } else if (selectedRow >= 0) {
    text("Selected Row: " + selectedRow + " (Height: " + rowHeights[selectedRow] + "px)", 20, height - 50);
  } else {
    text("No selection - click on grid lines to select", 20, height - 50);
  }
  text("Default cell size: " + defaultCellSize + "px", 20, height - 35);
  
  // Show diagonal states on screen for debugging
  fill(255, 0, 0);
  text("DIAGONAL STATUS: Vertical=" + verticalDiagonal + " Horizontal=" + horizontalDiagonal, 20, height - 15);
}

function drawCustomGrid() {
  // Handle pause timer
  if (animationPaused) {
    pauseTimer--;
    if (pauseTimer <= 0) {
      animationPaused = false;
    }
  }
  
  // Elastic animation for smooth movement (only when not paused)
  if (!animationPaused) {
    for (let i = 0; i < cols; i++) {
      let diff = targetColWidths[i] - animColWidths[i];
      animColWidths[i] += diff * animationSpeed;
      // Add much stronger elastic overshoot effect
      if (abs(diff) > 1.0) {
        animColWidths[i] += sin(frameCount * 0.1) * elasticity * (abs(diff) / 20);
      }
    }
    
    for (let j = 0; j < rows; j++) {
      let diff = targetRowHeights[j] - animRowHeights[j];
      animRowHeights[j] += diff * animationSpeed;
      // Add much stronger elastic overshoot effect
      if (abs(diff) > 1.0) {
        animRowHeights[j] += sin(frameCount * 0.1) * elasticity * (abs(diff) / 20);
      }
    }
  }

  stroke(200);
  strokeWeight(1);
  
  // Debug: log diagonal states occasionally
  if (frameCount % 60 === 0) { // Log every second
    console.log("Diagonal states - Vertical:", verticalDiagonal, "Horizontal:", horizontalDiagonal);
  }
  
  // Draw vertical lines (columns) with animated positions
  let currentX = 0;
  for (let i = 0; i <= cols; i++) {
    if (verticalDiagonal) {
      // Draw diagonal vertical lines (slanted)
      line(currentX, 0, currentX + diagonalSlant, height);
    } else {
      // Draw normal vertical lines
      line(currentX, 0, currentX, height);
    }
    if (i < cols) {
      currentX += animColWidths[i];
    }
  }
  
  // Draw horizontal lines (rows) with animated positions
  let currentY = 0;
  for (let j = 0; j <= rows; j++) {
    if (horizontalDiagonal) {
      // Draw diagonal horizontal lines (slanted)
      line(0, currentY, width, currentY + diagonalSlant);
    } else {
      // Draw normal horizontal lines
      line(0, currentY, width, currentY);
    }
    if (j < rows) {
      currentY += animRowHeights[j];
    }
  }
}

function drawSelectionHighlights() {
  // Highlight selected column
  if (selectedCol >= 0 && selectedCol < cols) {
    if (resizeFlashCol === selectedCol && resizeFlashTimer > 0) {
      // More dramatic pulsing flash effect
      let flashIntensity = sin(resizeFlashTimer * 0.1) * 0.5 + 0.5;
      fill(255, 100 + flashIntensity * 155, 0, 80 + flashIntensity * 120);
    } else {
      fill(255, 0, 0, 50);
    }
    noStroke();
    let x = getColumnX(selectedCol);
    rect(x, 0, animColWidths[selectedCol], height);
  }

  // Highlight selected row
  if (selectedRow >= 0 && selectedRow < rows) {
    if (resizeFlashRow === selectedRow && resizeFlashTimer > 0) {
      // More dramatic pulsing flash effect
      let flashIntensity = sin(resizeFlashTimer * 0.1) * 0.5 + 0.5;
      fill(0, 100 + flashIntensity * 155, 255, 80 + flashIntensity * 120);
    } else {
      fill(0, 255, 0, 50);
    }
    noStroke();
    let y = getRowY(selectedRow);
    rect(0, y, width, animRowHeights[selectedRow]);
  }
  // Animate flash feedback for resize - slower decay
  if (resizeFlashTimer > 0) {
    resizeFlashTimer -= 0.25; // Even slower countdown
    if (resizeFlashTimer <= 0) {
      resizeFlashCol = -1;
      resizeFlashRow = -1;
    }
  }
}

function getColumnX(colIndex) {
  let x = 0;
  for (let i = 0; i < colIndex; i++) {
    x += animColWidths[i];
  }
  return x;
}

function getRowY(rowIndex) {
  let y = 0;
  for (let j = 0; j < rowIndex; j++) {
    y += animRowHeights[j];
  }
  return y;
}

// Get distorted position for letters in diagonal grids
function getDistortedPosition(gridX, gridY) {
  let baseX = getColumnX(gridX);
  let baseY = getRowY(gridY);
  
  // Add diagonal offset based on position
  if (verticalDiagonal) {
    baseX += (baseY / height) * diagonalSlant;
  }
  if (horizontalDiagonal) {
    baseY += (baseX / width) * diagonalSlant;
  }
  
  return { x: baseX, y: baseY };
}

function mousePressed() {
  // Check if click is near a grid line to select column or row
  selectedCol = -1;
  selectedRow = -1;
  
  // Check for column selection (click near vertical lines)
  let currentX = 0;
  for (let i = 0; i <= cols; i++) {
    if (abs(mouseX - currentX) < 5) {
      if (i > 0) selectedCol = i - 1;
      else if (i < cols) selectedCol = i;
      return;
    }
    if (i < cols) {
      currentX += colWidths[i];
    }
  }
  
  // Check for row selection (click near horizontal lines)
  let currentY = 0;
  for (let j = 0; j <= rows; j++) {
    if (abs(mouseY - currentY) < 5) {
      if (j > 0) selectedRow = j - 1;
      else if (j < rows) selectedRow = j;
      return;
    }
    if (j < rows) {
      currentY += rowHeights[j];
    }
  }
}

function keyPressed() {
  console.log("Key:", key, "Code:", keyCode);
  
  // Handle +/- keys for resizing selected column or row
  if (key === '+' || key === '=') {
    if (selectedCol >= 0) {
      colWidths[selectedCol] += 2;
    } else if (selectedRow >= 0) {
      rowHeights[selectedRow] += 2;
    }
    return false;
  }
  
  if (key === '-' || key === '_') {
    if (selectedCol >= 0) {
      colWidths[selectedCol] = Math.max(5, colWidths[selectedCol] - 2);
    } else if (selectedRow >= 0) {
      rowHeights[selectedRow] = Math.max(5, rowHeights[selectedRow] - 2);
    }
    return false;
  }
  
  // ESC key to deselect
  if (keyCode === 27) { // ESC
    selectedCol = -1;
    selectedRow = -1;
    return false;
  }
  
  // Calculate max letters per line (each letter takes 6 cells, starting at position 2)
  let maxLettersPerLine = Math.floor((cols - 2) / 6);
  
  // Letters
  if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122)) {
    // Check if adding this letter would exceed line limit
    if (currentLine.length >= maxLettersPerLine) {
      // Move to next line automatically
      allLines.push([...currentLine]);
      currentLine = [];
      currentRow += 11;
      // Check if we need to wrap to top
      if (currentRow + 5 >= rows) {
        currentRow = 2;
      }
    }
    currentLine.push(key.toUpperCase());
    return false;
  }
  
  // Backspace (keyCode 8)
  if (keyCode === 8) {
    if (currentLine.length > 0) {
      currentLine.pop();
    } else if (allLines.length > 0) {
      // If current line is empty, get the last line
      currentLine = allLines.pop();
      currentRow -= 11;
      if (currentRow < 2) {
        currentRow = 2;
      }
    }
    return false;
  }
  
  // Enter (keyCode 13)  
  if (keyCode === 13) {
    allLines.push([...currentLine]);
    currentLine = [];
    currentRow += 11;
    if (currentRow + 5 >= rows) {
      currentRow = 2;
    }
    return false;
  }
  
  // Up arrow (keyCode 38)
  if (keyCode === 38) {
    currentRow = Math.max(2, currentRow - 11);
    return false;
  }
  
  // Down arrow (keyCode 40)
  if (keyCode === 40) {
    currentRow = Math.min(rows - 11, currentRow + 11);
    return false;
  }
  
  // Space (keyCode 32)
  if (keyCode === 32) {
    // Check if adding space would exceed line limit
    if (currentLine.length >= maxLettersPerLine) {
      // Move to next line automatically
      allLines.push([...currentLine]);
      currentLine = [];
      currentRow += 11;
      // Check if we need to wrap to top
      if (currentRow + 5 >= rows) {
        currentRow = 2;
      }
    }
    currentLine.push(' ');
    return false;
  }
}

function drawLetter(letter, gridX, gridY) {
  // Letters made bigger by 2 squares on each side (9x9 instead of 5x5)
  let patterns = {
    'A': [
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'B': [
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'C': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'D': [
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'E': [
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'F': [
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'G': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'H': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'I': [
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'J': [
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,0,1,1,1,0,0],
      [0,1,1,0,1,1,1,0,0],
      [0,1,1,0,1,1,1,0,0],
      [0,0,1,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'K': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'L': [
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'M': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,0,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'N': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,0,0,1,1,0],
      [0,1,1,1,1,0,1,1,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,0,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'O': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'P': [
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Q': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,0,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,0,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'R': [
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'S': [
      [0,0,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'T': [
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'U': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'V': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'W': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,0,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'X': [
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Y': [
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Z': [
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ]
  };
  
  if (patterns[letter]) {
    let pattern = patterns[letter];
    fill(0);
    noStroke();
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 1) {
          // Calculate position using distorted grid if diagonal modes are active
          let distortedPos = getDistortedPosition(gridX + x, gridY + y);
          let pixelX = distortedPos.x;
          let pixelY = distortedPos.y;
          let cellWidth = (gridX + x < cols) ? animColWidths[gridX + x] : defaultCellSize;
          let cellHeight = (gridY + y < rows) ? animRowHeights[gridY + y] : defaultCellSize;
          
          rect(pixelX, pixelY, cellWidth, cellHeight);
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = Math.floor(width / cellSize);
  rows = Math.floor(height / cellSize);
  initializeGrid();
  sizeSlider.position(20, 20);
  
  // Reposition diagonal buttons
  verticalButton.position(240, 20);
  horizontalButton.position(330, 20);
  bothButton.position(430, 20);
}
