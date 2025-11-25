let cellSize = 25; // Bigger grid cells
let cols, rows;
let allLines = []; // Store all lines of text
let currentLine = []; // Current line being typed
let currentRow = 2;

// Grid customization variables
let colWidths = []; // Array to store individual column widths
let rowHeights = []; // Array to store individual row heights
let selectedCol = -1; // Currently selected column
let selectedRow = -1; // Currently selected row
let defaultCellSize = 25;

// Animation variables
let isAnimating = false;
let animationButton;
let animationTime = 0;
let gridOffsets = []; // Store random offsets for grid lines

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
}

function initializeGrid() {
  colWidths = [];
  rowHeights = [];
  gridOffsets = [];
  
  for (let i = 0; i < cols; i++) {
    colWidths[i] = defaultCellSize;
    gridOffsets[i] = { x: 0, y: 0, targetX: 0, targetY: 0 };
  }
  for (let j = 0; j < rows; j++) {
    rowHeights[j] = defaultCellSize;
    if (!gridOffsets[j]) gridOffsets[j] = { x: 0, y: 0, targetX: 0, targetY: 0 };
  }
}

function draw() {
  background(255);
  
  // Update animation
  if (isAnimating) {
    animationTime += 0.02; // Slower increment (was 0.03)
    animateGridDynamically();
  }
  
  // Draw custom grid with variable column widths and row heights
  drawCustomGrid();
  
  // Draw all previous lines
  for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
    let line = allLines[lineIndex];
    let lineRow = 2 + lineIndex * 7;
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
  text("Type letters | Backspace=delete | Enter=new line | Up/Down arrows=change row", 20, height - 100);
  text("Click grid lines to select | +/- keys OR mouse wheel to resize | ESC to deselect", 20, height - 85);
  text("Animation Status: " + (isAnimating ? "ACTIVE - Dramatic grid morphing (slower speed)!" : "PAUSED - Grid frozen at last position"), 20, height - 70);
  if (selectedCol >= 0) {
    text("Selected Column: " + selectedCol + " (Width: " + Math.round(colWidths[selectedCol]) + "px) - Use mouse wheel!", 20, height - 55);
  } else if (selectedRow >= 0) {
    text("Selected Row: " + selectedRow + " (Height: " + Math.round(rowHeights[selectedRow]) + "px) - Use mouse wheel!", 20, height - 55);
  } else {
    text("No selection - click on grid lines to select, then scroll to resize", 20, height - 55);
  }
  text("Grid: " + cols + " x " + rows + " cells | Cell size: " + defaultCellSize + "px", 20, height - 40);
  
  if (isAnimating) {
    fill(255, 100, 0);
    text("⚡ LIVE ANIMATION: Dramatic grid movements and letter transformations (slower pace)", 20, height - 25);
  } else {
    fill(0, 150, 0);
    text("⏸ PAUSED: Grid maintains last animated state - ready to resume", 20, height - 25);
  }
}

function drawCustomGrid() {
  stroke(200);
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
      currentRow += 7;
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
      currentRow -= 7;
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
    currentRow += 7;
    if (currentRow + 5 >= rows) {
      currentRow = 2;
    }
    return false;
  }
  
  // Up arrow (keyCode 38)
  if (keyCode === 38) {
    currentRow = Math.max(2, currentRow - 7);
    return false;
  }
  
  // Down arrow (keyCode 40)
  if (keyCode === 40) {
    currentRow = Math.min(rows - 7, currentRow + 7);
    return false;
  }
  
  // Space (keyCode 32)
  if (keyCode === 32) {
    // Check if adding space would exceed line limit
    if (currentLine.length >= maxLettersPerLine) {
      // Move to next line automatically
      allLines.push([...currentLine]);
      currentLine = [];
      currentRow += 7;
      // Check if we need to wrap to top
      if (currentRow + 5 >= rows) {
        currentRow = 2;
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
    event.preventDefault(); // Prevent page scrolling
    return false; // Prevent page scrolling
  } else if (selectedRow >= 0) {
    let delta = event.delta > 0 ? -5 : 5; // Scroll up = smaller, scroll down = bigger (increased step size)
    rowHeights[selectedRow] += delta;
    rowHeights[selectedRow] = Math.max(5, Math.min(150, rowHeights[selectedRow])); // Clamp between 5-150
    event.preventDefault(); // Prevent page scrolling
    return false; // Prevent page scrolling
  }
  // If nothing is selected, allow normal page scrolling
}

function drawLetter(letter, gridX, gridY) {
  let patterns = {
    'A': [
      [0,1,1,1,0],
      [1,0,0,0,1], 
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1]
    ],
    'B': [
      [1,1,1,1,0],
      [1,0,0,0,1],
      [1,1,1,1,0], 
      [1,0,0,0,1],
      [1,1,1,1,0]
    ],
    'C': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,0],
      [1,0,0,0,1], 
      [0,1,1,1,0]
    ],
    'D': [
      [1,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,1,1,0]
    ],
    'E': [
      [1,1,1,1,1],
      [1,0,0,0,0],
      [1,1,1,1,0],
      [1,0,0,0,0],
      [1,1,1,1,1]
    ],
    'F': [
      [1,1,1,1,1],
      [1,0,0,0,0],
      [1,1,1,1,0],
      [1,0,0,0,0],
      [1,0,0,0,0]
    ],
    'G': [
      [0,1,1,1,0],
      [1,0,0,0,0],
      [1,0,1,1,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    'H': [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1]
    ],
    'I': [
      [1,1,1,1,1],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [1,1,1,1,1]
    ],
    'J': [
      [1,1,1,1,1],
      [0,0,0,1,0],
      [0,0,0,1,0],
      [1,0,0,1,0],
      [0,1,1,0,0]
    ],
    'K': [
      [1,0,0,0,1],
      [1,0,0,1,0],
      [1,1,1,0,0],
      [1,0,0,1,0],
      [1,0,0,0,1]
    ],
    'L': [
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,1,1,1,1]
    ],
    'M': [
      [1,0,0,0,1],
      [1,1,0,1,1],
      [1,0,1,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1]
    ],
    'N': [
      [1,0,0,0,1],
      [1,1,0,0,1],
      [1,0,1,0,1],
      [1,0,0,1,1],
      [1,0,0,0,1]
    ],
    'O': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    'P': [
      [1,1,1,1,0],
      [1,0,0,0,1],
      [1,1,1,1,0],
      [1,0,0,0,0],
      [1,0,0,0,0]
    ],
    'Q': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,1,0,1],
      [1,0,0,1,0],
      [0,1,1,0,1]
    ],
    'R': [
      [1,1,1,1,0],
      [1,0,0,0,1],
      [1,1,1,1,0],
      [1,0,0,1,0],
      [1,0,0,0,1]
    ],
    'S': [
      [0,1,1,1,1],
      [1,0,0,0,0],
      [0,1,1,1,0],
      [0,0,0,0,1],
      [1,1,1,1,0]
    ],
    'T': [
      [1,1,1,1,1],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0]
    ],
    'U': [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    'V': [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,0,1,0],
      [0,0,1,0,0]
    ],
    'W': [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,1,0,1],
      [1,1,0,1,1],
      [1,0,0,0,1]
    ],
    'X': [
      [1,0,0,0,1],
      [0,1,0,1,0],
      [0,0,1,0,0],
      [0,1,0,1,0],
      [1,0,0,0,1]
    ],
    'Y': [
      [1,0,0,0,1],
      [0,1,0,1,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0]
    ],
    'Z': [
      [1,1,1,1,1],
      [0,0,0,1,0],
      [0,0,1,0,0],
      [0,1,0,0,0],
      [1,1,1,1,1]
    ]
  };
  
  if (patterns[letter]) {
    let pattern = patterns[letter];
    fill(0);
    noStroke();
    
    // Calculate the total width and height this letter will occupy
    let letterPixelWidth = 0;
    let letterPixelHeight = 0;
    for (let x = 0; x < 5; x++) {
      letterPixelWidth += (gridX + x < cols) ? colWidths[gridX + x] : defaultCellSize;
    }
    for (let y = 0; y < 5; y++) {
      letterPixelHeight += (gridY + y < rows) ? rowHeights[gridY + y] : defaultCellSize;
    }
    
    // Calculate centering offsets within the 6x7 cell space allocated for each letter
    let totalSpaceWidth = 0;
    let totalSpaceHeight = 0;
    for (let x = 0; x < 6; x++) {
      totalSpaceWidth += (gridX + x - 1 < cols && gridX + x - 1 >= 0) ? colWidths[gridX + x - 1] : defaultCellSize;
    }
    for (let y = 0; y < 7; y++) {
      totalSpaceHeight += (gridY + y - 1 < rows && gridY + y - 1 >= 0) ? rowHeights[gridY + y - 1] : defaultCellSize;
    }
    
    let centerOffsetX = Math.max(0, (totalSpaceWidth - letterPixelWidth) / 2);
    let centerOffsetY = Math.max(0, (totalSpaceHeight - letterPixelHeight) / 2);
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 1) {
          // Calculate position using custom grid dimensions with centering
          let pixelX = getColumnX(gridX + x) + centerOffsetX;
          let pixelY = getRowY(gridY + y) + centerOffsetY;
          let cellWidth = (gridX + x < cols) ? colWidths[gridX + x] : defaultCellSize;
          let cellHeight = (gridY + y < rows) ? rowHeights[gridY + y] : defaultCellSize;
          
          rect(pixelX, pixelY, cellWidth, cellHeight);
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

function animateGridDynamically() {
  // Animate column widths with dramatic movements but slower speed
  for (let i = 0; i < cols; i++) {
    let wavePattern = sin(animationTime * 1.2 + i * 0.4) * 12; // Back to 12 amplitude, slower speed (1.2 vs 2)
    let randomDistortion = sin(animationTime * 3 + i * 1.2) * 8; // Back to 8 amplitude, slower speed (3 vs 5)
    let noiseOffset = noise(i * 0.1, animationTime * 0.3) * 15 - 7.5; // Back to 15 amplitude, slower speed (0.3 vs 0.5)
    
    colWidths[i] = defaultCellSize + wavePattern + randomDistortion + noiseOffset;
    colWidths[i] = Math.max(8, colWidths[i]); // Minimum size
  }
  
  // Animate row heights with dramatic movements but slower speed
  for (let j = 0; j < rows; j++) {
    let wavePattern = cos(animationTime * 1.0 + j * 0.3) * 10; // Back to 10 amplitude, slower speed (1.0 vs 1.8)
    let randomDistortion = cos(animationTime * 2.5 + j * 0.8) * 6; // Back to 6 amplitude, slower speed (2.5 vs 4)
    let noiseOffset = noise(j * 0.15, animationTime * 0.2) * 12 - 6; // Back to 12 amplitude, slower speed (0.2 vs 0.3)
    
    rowHeights[j] = defaultCellSize + wavePattern + randomDistortion + noiseOffset;
    rowHeights[j] = Math.max(8, rowHeights[j]); // Minimum size
  }
  
  // Add random "glitch" effects to grid occasionally (NO LETTER MORPHING)
  if (frameCount % 180 === 0 && random() < 0.4) { // Every 3 seconds, 40% chance
    addGridGlitch();
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
    } else {
      // Glitch a row
      let rowIndex = Math.floor(random(rows));
      let glitchAmount = random(15, 30) * (random() < 0.5 ? 1 : -1); // Back to dramatic 15-30 range
      rowHeights[rowIndex] += glitchAmount;
      rowHeights[rowIndex] = Math.max(5, rowHeights[rowIndex]);
    }
  }
}
