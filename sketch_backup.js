let cellSize = 15; // Grid cells made 15x15 pixels
let cols, rows;
let allLines = []; // Store all lines of text
let currentLine = []; // Current line being typed
let currentRow = 3;

// Grid customization variables
let colWidths = []; // Array to store individual column widths
let rowHeights = []; // Array to store individual row heights
let selectedCol = -1; // Currently selected column
let selectedRow = -1; // Currently selected row
let defaultCellSize = 15;

// Animation variables
let isAnimating = false;
let animationButton;
let animationTime = 0;
let gridOffsets = []; // Store random offsets for grid lines
let letterMorphing = []; // Store morphing data for letters

// Shape mode variables
let useCircles = false; // false = squares, true = circles
let shapeToggleButton;

// Dark mode variables
let darkMode = false; // false = light mode, true = dark mode
let darkModeButton;

// Variables to track manual grid changes
let manualColWidths = []; // Store manually set column widths
let manualRowHeights = []; // Store manually set row heights
let useManualAsBase = false; // Flag to indicate we should start animation from manual state

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = Math.floor(width / cellSize);
  rows = Math.floor(height / cellSize);
  
  // Initialize column widths and row heights
  initializeGrid();
  
  // Create animation toggle button
  animationButton = createButton('Start Grid Animation');
  animationButton.position(20, 20);
  animationButton.size(180, 35);
  animationButton.mousePressed(toggleAnimation);
  animationButton.style('background-color', '#4CAF50');
  animationButton.style('color', 'white');
  animationButton.style('border', 'none');
  animationButton.style('border-radius', '5px');
  animationButton.style('font-size', '14px');
  
  // Create shape toggle button
  shapeToggleButton = createButton('Switch to Circles');
  shapeToggleButton.position(220, 20);
  shapeToggleButton.size(150, 35);
  shapeToggleButton.mousePressed(toggleShape);
  shapeToggleButton.style('background-color', '#2196F3');
  shapeToggleButton.style('color', 'white');
  shapeToggleButton.style('border', 'none');
  shapeToggleButton.style('border-radius', '5px');
  shapeToggleButton.style('font-size', '14px');
  
  // Create dark mode toggle button
  darkModeButton = createButton('Dark Mode');
  darkModeButton.position(390, 20);
  darkModeButton.size(120, 35);
  darkModeButton.mousePressed(toggleDarkMode);
  darkModeButton.style('background-color', '#424242');
  darkModeButton.style('color', 'white');
  darkModeButton.style('border', 'none');
  darkModeButton.style('border-radius', '5px');
  darkModeButton.style('font-size', '14px');
}

function initializeGrid() {
  colWidths = [];
  rowHeights = [];
  gridOffsets = [];
  letterMorphing = [];
  
  for (let i = 0; i < cols; i++) {
    colWidths[i] = defaultCellSize;
    gridOffsets[i] = { x: 0, y: 0, targetX: 0, targetY: 0 };
  }
  for (let j = 0; j < rows; j++) {
    rowHeights[j] = defaultCellSize;
    if (!gridOffsets[j]) gridOffsets[j] = { x: 0, y: 0, targetX: 0, targetY: 0 };
  }
  
  // Initialize letter morphing data
  for (let i = 0; i < allLines.length; i++) {
    if (!letterMorphing[i]) letterMorphing[i] = [];
    for (let j = 0; j < allLines[i].length; j++) {
      if (!letterMorphing[i][j]) {
        letterMorphing[i][j] = {
          morphAmount: 0,
          targetMorph: 0,
          lastChange: 0
        };
      }
    }
  }
}

function draw() {
  // Set background color based on mode
  background(darkMode ? 0 : 255);
  
  // Update animation
  if (isAnimating) {
    animationTime += 0.008; // Much slower increment for more hypnotic effect
    animateGridDynamically();
  }
  
  // Draw custom grid with variable column widths and row heights
  drawCustomGrid();
  
  // Draw all previous lines
  for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
    let line = allLines[lineIndex];
    let lineRow = 3 + lineIndex * 11;
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ') {
        drawLetter(line[i], 3 + i * 8, lineRow);
      }
    }
  }
  
  // Draw current line
  if (currentLine.length > 0) {
    for (let i = 0; i < currentLine.length; i++) {
      if (currentLine[i] !== ' ') {
        drawLetter(currentLine[i], 3 + i * 8, currentRow);
      }
    }
  }
  
  // Draw selection highlights
  drawSelectionHighlights();
  
  // Draw instructions
  // Set text color based on mode
  fill(darkMode ? 255 : 0);
  noStroke();
  textSize(12);
  text("Type letters & numbers | Backspace=delete | Enter=new line | Up/Down arrows=change row", 20, height - 100);
  text("Click grid lines to select | +/- keys OR mouse wheel to resize | ESC to deselect", 20, height - 85);
  text("Shape: " + (useCircles ? "CIRCLES" : "SQUARES") + " | Mode: " + (darkMode ? "DARK" : "LIGHT") + " | Animation: " + (isAnimating ? "ACTIVE" : "PAUSED"), 20, height - 70);
  if (selectedCol >= 0) {
    text("Selected Column: " + selectedCol + " (Width: " + Math.round(colWidths[selectedCol]) + "px) - Use mouse wheel!", 20, height - 55);
  } else if (selectedRow >= 0) {
    text("Selected Row: " + selectedRow + " (Height: " + Math.round(rowHeights[selectedRow]) + "px) - Use mouse wheel!", 20, height - 55);
  } else {
    text("No selection - click on grid lines to select, then scroll to resize", 20, height - 55);
  }
  text("Grid: " + cols + " x " + rows + " cells | Cell size: " + defaultCellSize + "px", 20, height - 40);
  
  if (isAnimating) {
    fill(darkMode ? 255 : 255, darkMode ? 150 : 100, darkMode ? 100 : 0);
    text("⚡ LIVE ANIMATION: Dramatic grid movements and letter transformations", 20, height - 25);
  } else {
    fill(darkMode ? 100 : 0, darkMode ? 255 : 150, darkMode ? 100 : 0);
    text("⏸ PAUSED: Grid maintains last animated state - ready to resume", 20, height - 25);
  }
}

function drawCustomGrid() {
  // Set grid color based on mode
  stroke(darkMode ? 60 : 200);
  strokeWeight(1);
  
  // Draw vertical lines (columns)
  let currentX = 0;
  for (let i = 0; i <= cols; i++) {
    line(currentX, 0, currentX, height);
    if (i < cols) {
      currentX += colWidths[i];
    }
  }
  
  // Draw horizontal lines (rows)
  let currentY = 0;
  for (let j = 0; j <= rows; j++) {
    line(0, currentY, width, currentY);
    if (j < rows) {
      currentY += rowHeights[j];
    }
  }
}

function drawSelectionHighlights() {
  // Highlight selected column
  if (selectedCol >= 0 && selectedCol < cols) {
    fill(255, 0, 0, 50);
    noStroke();
    let x = getColumnX(selectedCol);
    rect(x, 0, colWidths[selectedCol], height);
  }
  
  // Highlight selected row
  if (selectedRow >= 0 && selectedRow < rows) {
    fill(0, 255, 0, 50);
    noStroke();
    let y = getRowY(selectedRow);
    rect(0, y, width, rowHeights[selectedRow]);
  }
}

function getColumnX(colIndex) {
  let x = 0;
  for (let i = 0; i < colIndex; i++) {
    x += colWidths[i];
  }
  return x;
}

function getRowY(rowIndex) {
  let y = 0;
  for (let j = 0; j < rowIndex; j++) {
    y += rowHeights[j];
  }
  return y;
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
  
  // Handle +/- keys for resizing selected column or row (only when something is selected)
  if ((key === '+' || key === '=') && (selectedCol >= 0 || selectedRow >= 0)) {
    if (selectedCol >= 0) {
      colWidths[selectedCol] += 2;
      saveManualGridState(); // Save manual changes as new animation base
    } else if (selectedRow >= 0) {
      rowHeights[selectedRow] += 2;
      saveManualGridState(); // Save manual changes as new animation base
    }
    return false;
  }
  
  if ((key === '-' || key === '_') && (selectedCol >= 0 || selectedRow >= 0)) {
    if (selectedCol >= 0) {
      colWidths[selectedCol] = Math.max(5, colWidths[selectedCol] - 2);
      saveManualGridState(); // Save manual changes as new animation base
    } else if (selectedRow >= 0) {
      rowHeights[selectedRow] = Math.max(5, rowHeights[selectedRow] - 2);
      saveManualGridState(); // Save manual changes as new animation base
    }
    return false;
  }
  
  // ESC key to deselect
  if (keyCode === 27) { // ESC
    selectedCol = -1;
    selectedRow = -1;
    return false;
  }
  
  // Calculate max letters per line (each letter takes 6 cells, starting at position 3, with 3-cell border on each side)
  let maxLettersPerLine = Math.floor((cols - 6) / 6); // 3 cells border on left + 3 on right = 6 total
  
  // Calculate max number of lines that can fit (each line takes 7 cells height, with 3-cell borders)
  let maxLines = Math.floor((rows - 6) / 7); // 3 cells border on top + 3 on bottom = 6 total
  
  // Letters, Numbers and Symbols
  if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122) || (keyCode >= 48 && keyCode <= 57) || 
      key === '.' || key === '/' || key === '-' || key === '+' || key === '*' || key === '(' || key === ')' || key === '#' || key === '!') {
    // Check if writing space is completely full
    if (allLines.length >= maxLines && currentLine.length >= maxLettersPerLine) {
      return false; // Don't allow any more typing - space is full!
    }
    
    // Check if adding this character would exceed line limit
    if (currentLine.length >= maxLettersPerLine) {
      // Check if we have room for another line
      if (allLines.length >= maxLines - 1) {
        return false; // No more room for new lines
      }
      
      // Move to next line automatically
      allLines.push([...currentLine]);
      currentLine = [];
      currentRow += 11;
      // Check if we need to wrap to top (3-cell border at bottom)
      if (currentRow + 5 >= rows - 3) {
        currentRow = 3;
      }
    }
    // Convert letters to uppercase, keep numbers and symbols as-is
    if ((keyCode >= 48 && keyCode <= 57) || key === '.' || key === '/' || key === '-' || key === '+' || key === '*' || key === '(' || key === ')' || key === '#' || key === '!') {
      currentLine.push(key);
    } else {
      currentLine.push(key.toUpperCase());
    }
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
      if (currentRow < 3) {
        currentRow = 3;
      }
    }
    return false;
  }
  
  // Enter (keyCode 13)  
  if (keyCode === 13) {
    allLines.push([...currentLine]);
    currentLine = [];
    currentRow += 11;
    if (currentRow + 5 >= rows - 3) {
      currentRow = 3;
    }
    return false;
  }
  
  // Up arrow (keyCode 38)
  if (keyCode === 38) {
    currentRow = Math.max(3, currentRow - 11);
    return false;
  }
  
  // Down arrow (keyCode 40)
  if (keyCode === 40) {
    currentRow = Math.min(rows - 10, currentRow + 11); // 3-cell border at bottom + 7 for letter height
    return false;
  }
  
  // Space (keyCode 32)
  if (keyCode === 32) {
    // Check if writing space is completely full
    if (allLines.length >= maxLines && currentLine.length >= maxLettersPerLine) {
      return false; // Don't allow any more typing - space is full!
    }
    
    // Check if adding space would exceed line limit
    if (currentLine.length >= maxLettersPerLine) {
      // Check if we have room for another line
      if (allLines.length >= maxLines - 1) {
        return false; // No more room for new lines
      }
      
      // Move to next line automatically
      allLines.push([...currentLine]);
      currentLine = [];
      currentRow += 11;
      // Check if we need to wrap to top (3-cell border at bottom)
      if (currentRow + 5 >= rows - 3) {
        currentRow = 3;
      }
    }
    currentLine.push(' ');
    return false;
  }
}

function mouseWheel(event) {
  // Use mouse wheel to resize selected column or row
  if (selectedCol >= 0) {
    let delta = event.delta > 0 ? -5 : 5; // Scroll up = smaller, scroll down = bigger (increased step size)
    colWidths[selectedCol] += delta;
    colWidths[selectedCol] = Math.max(5, Math.min(150, colWidths[selectedCol])); // Clamp between 5-150
    saveManualGridState(); // Save manual changes as new animation base
    event.preventDefault(); // Prevent page scrolling
    return false; // Prevent page scrolling
  } else if (selectedRow >= 0) {
    let delta = event.delta > 0 ? -5 : 5; // Scroll up = smaller, scroll down = bigger (increased step size)
    rowHeights[selectedRow] += delta;
    rowHeights[selectedRow] = Math.max(5, Math.min(150, rowHeights[selectedRow])); // Clamp between 5-150
    saveManualGridState(); // Save manual changes as new animation base
    event.preventDefault(); // Prevent page scrolling
    return false; // Prevent page scrolling
  }
  // If nothing is selected, allow normal page scrolling
}

function drawLetter(letter, gridX, gridY) {
  // ClashGrotesk-inspired letter patterns (9x9 grid) - both uppercase and lowercase
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
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,1,1,1,0],
      [0,1,1,0,0,1,1,1,0],
      [0,1,1,0,0,1,1,1,0],
      [0,1,1,0,0,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'K': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,1,1,0,0,0,0],
      [0,1,1,1,1,0,0,0,0],
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
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,0,1,1,1,0],
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
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,0,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'R': [
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'S': [
      [0,0,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
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
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,0,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'X': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Y': [
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
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
    ],
    '0': [
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
    '1': [
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '2': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '3': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '4': [
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '5': [
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '6': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '7': [
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '8': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '9': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '.': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '/': [
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '-': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '+': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '*': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,1,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,1,0,1,1,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '(': [
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    ')': [
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '#': [
      [0,0,1,0,1,0,1,0,0],
      [0,0,1,0,1,0,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,0,1,0,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,0,1,0,1,0,0],
      [0,0,1,0,1,0,1,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '!': [
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ]
  };
  
  if (patterns[letter]) {
    let pattern = patterns[letter];
    // Set letter color based on mode
    fill(darkMode ? 255 : 0);
    noStroke();
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 1) {
          // Calculate position using custom grid dimensions
          let pixelX = getColumnX(gridX + x);
          let pixelY = getRowY(gridY + y);
          let cellWidth = (gridX + x < cols) ? colWidths[gridX + x] : defaultCellSize;
          let cellHeight = (gridY + y < rows) ? rowHeights[gridY + y] : defaultCellSize;
          
          if (useCircles) {
            // Draw circles that automatically connect by overlapping significantly
            let centerX = pixelX + cellWidth / 2;
            let centerY = pixelY + cellHeight / 2;
            // Use the average of width and height to keep circles round
            let avgCellSize = (cellWidth + cellHeight) / 2;
            // Make circles much bigger (180% of average cell size) to ensure automatic connection
            let diameter = avgCellSize * 1.8;
            ellipse(centerX, centerY, diameter, diameter);
          } else {
            // Draw rectangles (original behavior)
            rect(pixelX, pixelY, cellWidth, cellHeight);
          }
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = Math.floor(width / defaultCellSize);
  rows = Math.floor(height / defaultCellSize);
  initializeGrid();
  animationButton.position(20, 20);
  shapeToggleButton.position(220, 20);
  darkModeButton.position(390, 20);
}

function saveManualGridState() {
  // Save current grid state as the new base for animation
  manualColWidths = [...colWidths];
  manualRowHeights = [...rowHeights];
  useManualAsBase = true;
  console.log("Saved manual grid state for animation base");
}

function toggleAnimation() {
  isAnimating = !isAnimating;
  if (isAnimating) {
    animationButton.html('Pause Grid Animation');
    animationButton.style('background-color', '#f44336');
  } else {
    animationButton.html('Resume Grid Animation');
    animationButton.style('background-color', '#FF9800'); // Orange for resume
    // Keep current grid state - don't reset!
    // The grid will maintain its last animated position
  }
}

function toggleShape() {
  useCircles = !useCircles;
  if (useCircles) {
    shapeToggleButton.html('Switch to Squares');
    shapeToggleButton.style('background-color', '#9C27B0'); // Purple for circles
  } else {
    shapeToggleButton.html('Switch to Circles');
    shapeToggleButton.style('background-color', '#2196F3'); // Blue for squares
  }
}

function toggleDarkMode() {
  darkMode = !darkMode;
  if (darkMode) {
    darkModeButton.html('Light Mode');
    darkModeButton.style('background-color', '#FFC107'); // Yellow for light mode switch
    darkModeButton.style('color', 'black');
  } else {
    darkModeButton.html('Dark Mode');
    darkModeButton.style('background-color', '#424242'); // Dark gray for dark mode switch
    darkModeButton.style('color', 'white');
  }
}

function animateGridDynamically() {
  // Get the base sizes (either default or manually set)
  let baseColWidths = useManualAsBase ? manualColWidths : Array(cols).fill(defaultCellSize);
  let baseRowHeights = useManualAsBase ? manualRowHeights : Array(rows).fill(defaultCellSize);
  
  // Animate column widths with dramatic movements but slower speed
  for (let i = 0; i < cols; i++) {
    let wavePattern = sin(animationTime * 1.2 + i * 0.4) * 12; // Back to 12 amplitude, slower speed (1.2 vs 2)
    let randomDistortion = sin(animationTime * 3 + i * 1.2) * 8; // Back to 8 amplitude, slower speed (3 vs 5)
    let noiseOffset = noise(i * 0.1, animationTime * 0.3) * 15 - 7.5; // Back to 15 amplitude, slower speed (0.3 vs 0.5)
    
    colWidths[i] = baseColWidths[i] + wavePattern + randomDistortion + noiseOffset;
    colWidths[i] = Math.max(8, colWidths[i]); // Minimum size
  }
  
  // Animate row heights with dramatic movements but slower speed
  for (let j = 0; j < rows; j++) {
    let wavePattern = cos(animationTime * 1.0 + j * 0.3) * 10; // Back to 10 amplitude, slower speed (1.0 vs 1.8)
    let randomDistortion = cos(animationTime * 2.5 + j * 0.8) * 6; // Back to 6 amplitude, slower speed (2.5 vs 4)
    let noiseOffset = noise(j * 0.15, animationTime * 0.2) * 12 - 6; // Back to 12 amplitude, slower speed (0.2 vs 0.3)
    
    rowHeights[j] = baseRowHeights[j] + wavePattern + randomDistortion + noiseOffset;
    rowHeights[j] = Math.max(8, rowHeights[j]); // Minimum size
  }
  
  // Add random "glitch" effects to grid occasionally
  if (frameCount % 180 === 0 && random() < 0.4) { // Every 3 seconds, 40% chance
    addGridGlitch();
  }
}

function morphRandomLetters() {
  if (allLines.length === 0) return;
  
  // Pick 1-3 random letters to change
  let numChanges = Math.floor(random(1, 4));
  
  for (let change = 0; change < numChanges; change++) {
    let lineIndex = Math.floor(random(allLines.length));
    let line = allLines[lineIndex];
    
    if (line.length === 0) continue;
    
    let letterIndex = Math.floor(random(line.length));
    
    // Only change actual letters, not spaces
    if (line[letterIndex] !== ' ') {
      let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let newLetter = letters[Math.floor(random(letters.length))];
      
      // Smooth transition effect
      if (!letterMorphing[lineIndex]) letterMorphing[lineIndex] = [];
      if (!letterMorphing[lineIndex][letterIndex]) {
        letterMorphing[lineIndex][letterIndex] = { morphAmount: 0, targetMorph: 0, lastChange: 0 };
      }
      
      letterMorphing[lineIndex][letterIndex].targetMorph = 1;
      
      // Change the letter after a brief delay
      setTimeout(() => {
        if (allLines[lineIndex] && allLines[lineIndex][letterIndex]) {
          allLines[lineIndex][letterIndex] = newLetter;
        }
      }, 150);
    }
  }
}

function addGridGlitch() {
  // Add dramatic distortion to random columns/rows but less frequently
  let numGlitches = Math.floor(random(2, 6)); // Back to original range
  
  for (let i = 0; i < numGlitches; i++) {
    if (random() < 0.5) {
      // Glitch a column
      let colIndex = Math.floor(random(cols));
      let glitchAmount = random(20, 40) * (random() < 0.5 ? 1 : -1); // Back to dramatic 20-40 range
      colWidths[colIndex] += glitchAmount;
      colWidths[colIndex] = Math.max(5, colWidths[colIndex]);
      
      // Update manual base to include this change so it becomes the new starting point
      if (useManualAsBase && manualColWidths[colIndex]) {
        manualColWidths[colIndex] = colWidths[colIndex];
      }
    } else {
      // Glitch a row
      let rowIndex = Math.floor(random(rows));
      let glitchAmount = random(15, 30) * (random() < 0.5 ? 1 : -1); // Back to dramatic 15-30 range
      rowHeights[rowIndex] += glitchAmount;
      rowHeights[rowIndex] = Math.max(5, rowHeights[rowIndex]);
      
      // Update manual base to include this change so it becomes the new starting point
      if (useManualAsBase && manualRowHeights[rowIndex]) {
        manualRowHeights[rowIndex] = rowHeights[rowIndex];
      }
    }
  }
}
