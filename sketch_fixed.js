let cellSize = 15; // Grid cells made 15x15 pixels
let cols, rows;
let allLines = []; // Store all lines of text
let currentLine = []; // Current line being typed
let currentRow; // Will be calculated to center vertically

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
let useOutline = false; // false = filled, true = outlined
let shapeToggleButton;
let outlineToggleButton;

// Shape scaling variables (works for both circles and squares)
let shapeScaling = false; // Enable dynamic shape scaling
let shapeScaleMode = "pulse"; // "pulse", "wave", "random", "breathing", "ripple"
let shapeScaleButton;
let scaleTime = 0; // Time for scaling animations
let baseShapeScale = 1.0; // Base scale for shapes
let maxShapeScale = 2.5; // Maximum scale multiplier
let minShapeScale = 0.3; // Minimum scale multiplier

// Dark mode variables
let darkMode = false; // false = light mode, true = dark mode
let darkModeButton;

// Font variables
let useStardomFont = false; // false = ClashGrotesk, true = Stardom
let fontToggleButton;

// Letter scaling variables
let letterScale = 1.0; // Scale factor for letters (1.0 = normal, 2.0 = double size, 0.5 = half size)
let letterSizeMode = "Normal"; // "Small", "Normal", "Large", "XLarge"
let letterPixelSize = 1; // How many grid cells each letter pixel takes up



// Photo mode variables
let photoMode = false; // false = text/brush mode, true = photo mode
let photoButton;
let photoPixels = []; // Store photo pixels as [x, y] coordinates
let photoInput; // File input for photo upload
let loadedImage; // The loaded p5 image
let photoScale = 1.0; // Scale factor for photo size
let photoBrightness = 128; // Threshold for black/white conversion (0-255)

// Legacy brush mode variables (for compatibility)
let brushMode = false;
let brushButton;
let customDrawing = [];

// Custom font mode variables
let customFontMode = false; // false = use built-in fonts, true = use custom font
let customFontButton;
let customFontInput; // File input for font upload
let customFont; // The loaded p5 font object
let customFontPatterns = {}; // Store custom letter patterns
let fontRenderSize = 72; // Size to render font for pattern generation
let fontThreshold = 0.3; // Alpha threshold for pattern generation (0-1)
let charactersToGenerate = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()+-=[]{}|;:,.<>?/"; // Characters to generate

// Diagonal line modes
let diagonalSlant = 60; // How much the lines slant (pixels)

// Sliders for diagonal adjustments (removed)

// Variables to track manual grid changes
let manualColWidths = []; // Store manually set column widths
let manualRowHeights = []; // Store manually set row heights
let useManualAsBase = false; // Flag to indicate we should start animation from manual state

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  cols = Math.floor(width / cellSize);
  rows = Math.floor(height / cellSize);
  
  // Initialize currentRow to center vertically
  currentRow = Math.floor(rows / 2);
  
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
  
  // Create font toggle button
  fontToggleButton = createButton('CLASH');
  fontToggleButton.position(530, 20);
  fontToggleButton.size(130, 35);
  fontToggleButton.mousePressed(toggleFont);
  fontToggleButton.style('background-color', '#8B008B'); // Dark magenta for Clash
  fontToggleButton.style('color', 'white');
  fontToggleButton.style('border', 'none');
  fontToggleButton.style('border-radius', '5px');
  fontToggleButton.style('font-size', '14px');
  
  // Create outline toggle button
  outlineToggleButton = createButton('FILLED');
  outlineToggleButton.position(530, 65);
  outlineToggleButton.size(130, 35);
  outlineToggleButton.mousePressed(toggleOutline);
  outlineToggleButton.style('background-color', '#795548');
  outlineToggleButton.style('color', 'white');
  outlineToggleButton.style('border', 'none');
  outlineToggleButton.style('border-radius', '5px');
  outlineToggleButton.style('font-size', '14px');
  
  // Create letter size button
  let letterSizeButton = createButton('SIZE: Normal');
  letterSizeButton.position(20, 65);
  letterSizeButton.size(140, 35);
  letterSizeButton.mousePressed(toggleLetterSize);
  letterSizeButton.style('background-color', '#FF9800'); // Orange
  letterSizeButton.style('color', 'white');
  letterSizeButton.style('border', '2px solid white');
  letterSizeButton.style('border-radius', '5px');
  letterSizeButton.style('font-size', '14px');
  letterSizeButton.style('font-weight', 'bold');
  
  // Store reference globally
  window.letterSizeButton = letterSizeButton;
  
  // Create shape scaling button (works for both circles and squares)
  shapeScaleButton = createButton('SCALE: OFF');
  shapeScaleButton.position(20, 105);
  shapeScaleButton.size(140, 35);
  shapeScaleButton.mousePressed(toggleShapeScaling);
  shapeScaleButton.style('background-color', '#FF5722'); // Deep Orange
  shapeScaleButton.style('color', 'white');
  shapeScaleButton.style('border', '2px solid white');
  shapeScaleButton.style('border-radius', '5px');
  shapeScaleButton.style('font-size', '14px');
  shapeScaleButton.style('font-weight', 'bold');
  
  // Create photo mode button
  photoButton = createButton('PHOTO: OFF');
  photoButton.position(180, 105);
  photoButton.size(140, 35);
  photoButton.mousePressed(togglePhotoMode);
  photoButton.style('background-color', '#607D8B'); // Blue Grey
  photoButton.style('color', 'white');
  photoButton.style('border', '2px solid white');
  photoButton.style('border-radius', '5px');
  photoButton.style('font-size', '14px');
  photoButton.style('font-weight', 'bold');
  
  // Create hidden file input for photo upload
  photoInput = createFileInput(handlePhotoUpload);
  photoInput.hide(); // Keep it hidden, we'll trigger it with the button
  
  // Create custom font button
  customFontButton = createButton('FONT: BUILT-IN');
  customFontButton.position(340, 105);
  customFontButton.size(160, 35);
  customFontButton.mousePressed(toggleCustomFont);
  customFontButton.style('background-color', '#3F51B5'); // Indigo
  customFontButton.style('color', 'white');
  customFontButton.style('border', '2px solid white');
  customFontButton.style('border-radius', '5px');
  customFontButton.style('font-size', '14px');
  customFontButton.style('font-weight', 'bold');
  
  // Create hidden file input for font upload
  customFontInput = createFileInput(handleFontUpload);
  customFontInput.hide(); // Keep it hidden, we'll trigger it with the button
  customFontInput.attribute('accept', '.ttf,.otf,.woff,.woff2'); // Accept font files only
  
  // Initialize button styles
  updateButtonStyles();
  
  // Make sure canvas can receive keyboard events
  canvas.parent(document.body);
  canvas.elt.setAttribute('tabindex', '0'); // Make canvas focusable
  canvas.elt.focus(); // Focus immediately
  
  // Add multiple ways to ensure focus
  document.addEventListener('click', () => {
    canvas.elt.focus();
  });
  
  // Ensure focus when mouse enters canvas
  canvas.elt.addEventListener('mouseenter', () => {
    canvas.elt.focus();
  });
  
  // Focus on window load
  window.addEventListener('load', () => {
    setTimeout(() => {
      canvas.elt.focus();
    }, 100);
  });
  
  // LAPTOP FIX: More aggressive focus handling for laptop keyboards
  // Focus on any user interaction
  document.addEventListener('keydown', () => {
    if (document.activeElement !== canvas.elt) {
      canvas.elt.focus();
    }
  });
  
  // Continuous focus check for laptops
  setInterval(() => {
    if (document.activeElement !== canvas.elt) {
      canvas.elt.focus();
    }
  }, 500); // Check every 500ms
  
  // Focus on mouse movement over canvas
  canvas.elt.addEventListener('mousemove', () => {
    if (document.activeElement !== canvas.elt) {
      canvas.elt.focus();
    }
  });
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
  
  // Update shape scaling animation
  if (shapeScaling) {
    scaleTime += 0.05; // Scaling animation speed
  }
  
  // Draw custom grid with variable column widths and row heights
  drawCustomGrid();
  
  // Calculate vertical center for all text with bounds checking
  let totalLines = allLines.length + (currentLine.length > 0 ? 1 : 0);
  
  // Calculate spacing based on letter size and font type
  let letterSpacing = customFontMode ? 15 : (useStardomFont ? 10 : 9); // More spacing for 13x13 custom fonts
  let lineSpacing = customFontMode ? 15 : 11; // More line spacing for custom fonts
  
  // Adjust spacing for bigger letters
  if (letterPixelSize > 1) {
    letterSpacing = letterSpacing * letterPixelSize + (letterPixelSize - 1) * 2; // Add extra space between letters
    lineSpacing = lineSpacing * letterPixelSize + (letterPixelSize - 1) * 3; // Add extra space between lines
  }
  
  let textBlockHeight = totalLines * lineSpacing;
  let startY = Math.floor((rows - textBlockHeight) / 2);
  
  // Ensure text doesn't go above or below canvas
  startY = Math.max(1, startY); // At least 1 row from top
  startY = Math.min(rows - textBlockHeight - 1, startY); // At least 1 row from bottom
  
  // Draw all previous lines
  for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
    let line = allLines[lineIndex];
    let lineRow = startY + lineIndex * lineSpacing;
    
    // Calculate center position for this line with bounds checking
    let lineWidth = line.length * letterSpacing;
    let startX = Math.floor((cols - lineWidth) / 2);
    
    // Ensure text doesn't go outside canvas horizontally
    startX = Math.max(1, startX); // At least 1 column from left
    startX = Math.min(cols - lineWidth - 1, startX); // At least 1 column from right
    
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ') {
        drawLetter(line[i], startX + i * letterSpacing, lineRow);
      }
    }
  }
  
  // Draw current line
  if (currentLine.length > 0) {
    let lineRow = startY + allLines.length * lineSpacing;
    
    // Calculate center position for current line with bounds checking
    let lineWidth = currentLine.length * letterSpacing;
    let startX = Math.floor((cols - lineWidth) / 2);
    
    // Ensure text doesn't go outside canvas horizontally
    startX = Math.max(1, startX); // At least 1 column from left
    startX = Math.min(cols - lineWidth - 1, startX); // At least 1 column from right
    
    for (let i = 0; i < currentLine.length; i++) {
      if (currentLine[i] !== ' ') {
        drawLetter(currentLine[i], startX + i * letterSpacing, lineRow);
      }
    }
  }
  

  
  // Draw photo pixels (always show if they exist)
  if (photoPixels.length > 0) {
    for (let pixelKey of photoPixels) {
      let coords = pixelKey.split(',');
      let gridX = parseInt(coords[0]);
      let gridY = parseInt(coords[1]);
      
      // Draw the photo pixel with scaling support
      drawCustomPixel(gridX, gridY);
    }
  }
  
  // Draw selection highlights
  drawSelectionHighlights();
  
  // Draw instructions
  // Set text color based on mode
  fill(darkMode ? 255 : 0);
  noStroke();
  textSize(12);
  
  if (photoMode) {
    text("PHOTO MODE: Image converted to grid pixels | All effects work: Scaling, Shapes, Colors, Animations", 20, height - 100);
    text("Brightness threshold: " + photoBrightness + " | Use [ ] keys to adjust darkness/lightness | ESC to clear", 20, height - 85);
  } else {
    text("Type letters & numbers | Backspace=delete | Enter=new line | Up/Down arrows=change row", 20, height - 100);
    if (customFontMode) {
      text("CUSTOM FONT ACTIVE | Use { } keys to adjust thickness (threshold: " + (fontThreshold * 100).toFixed(0) + "%) | " + Object.keys(customFontPatterns).length + " chars loaded", 20, height - 85);
    } else {
      text("Click grid lines to select | +/- keys OR mouse wheel to resize | ESC to deselect", 20, height - 85);
    }
    
    // LAPTOP FIX: Show focus status for debugging
    let focusStatus = document.activeElement === canvas.elt ? "FOCUSED ✓" : "NOT FOCUSED - Click canvas";
    fill(document.activeElement === canvas.elt ? (darkMode ? 0 : 0, 255, 0) : (255, 0, 0));
    text("Canvas Focus: " + focusStatus, 20, height - 70);
  }
  
  let fontDisplay = customFontMode ? "CUSTOM" : (useStardomFont ? "STARDOM" : "CLASH");
  text("Shape: " + (useCircles ? "CIRCLES" : "SQUARES") + (shapeScaling ? " (" + shapeScaleMode.toUpperCase() + ")" : "") + " | Fill: " + (useOutline ? "OUTLINE" : "FILLED") + " | Mode: " + (darkMode ? "DARK" : "LIGHT") + " | Font: " + fontDisplay + " | Animation: " + (isAnimating ? "ACTIVE" : "PAUSED"), 20, height - 70);
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
    // Draw normal vertical lines
    line(currentX, 0, currentX, height);
    if (i < cols) {
      currentX += colWidths[i];
    }
  }
  
  // Draw horizontal lines (rows)
  let currentY = 0;
  for (let j = 0; j <= rows; j++) {
    // Draw normal horizontal lines
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

// Get distorted position for letters in diagonal grids
function getDistortedPosition(gridX, gridY) {
  // Start with the base grid position
  let baseX = getColumnX(gridX);
  let baseY = getRowY(gridY);
  
  // Apply vertical diagonal distortion if active
  let distortedX = baseX;
  let distortedY = baseY;
  
  return { x: distortedX, y: distortedY };
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

function mouseDragged() {
  // No brush mode functionality needed
}

function mouseReleased() {
  // No brush mode functionality needed
}

function keyPressed() {
  console.log("Key pressed from COPY folder! Key:", key, "Code:", keyCode, "PhotoMode:", photoMode, "CustomFontMode:", customFontMode);
  
  // LAPTOP FIX: Enhanced keyboard handling for laptop keyboards
  // Force focus on canvas for laptop keyboards
  if (document.activeElement !== canvas.elt) {
    canvas.elt.focus();
  }
  
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
  
  // ESC key to deselect or clear photo
  if (keyCode === 27) { // ESC
    if (photoMode) {
      photoPixels = []; // Clear photo pixels
    } else {
      selectedCol = -1;
      selectedRow = -1;
    }
    return false;
  }
  
  // Handle brightness adjustment in photo mode
  if (photoMode) {
    if (key === '[') {
      photoBrightness = Math.max(0, photoBrightness - 10);
      if (loadedImage) processPhotoToGrid(); // Reprocess with new threshold
      return false;
    }
    if (key === ']') {
      photoBrightness = Math.min(255, photoBrightness + 10);
      if (loadedImage) processPhotoToGrid(); // Reprocess with new threshold
      return false;
    }
    return false; // Don't handle other keys in photo mode
  }
  
  // Handle threshold adjustment for custom font
  if (customFontMode && customFont) {
    if (key === '{') {
      fontThreshold = Math.max(0.1, fontThreshold - 0.1);
      processFontToPatterns(); // Reprocess with new threshold
      return false;
    }
    if (key === '}') {
      fontThreshold = Math.min(0.9, fontThreshold + 0.1);
      processFontToPatterns(); // Reprocess with new threshold
      return false;
    }
  }
  

  
  // Calculate bounds for centered text
  let letterSpacing = customFontMode ? 15 : (useStardomFont ? 10 : 9);
  
  // LAPTOP FIX: Enhanced character detection for laptop keyboards
  // Check for printable characters using multiple methods
  let isLetter = (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122) || 
                 (key && key.length === 1 && key.match(/[a-zA-Z]/));
  let isNumber = (keyCode >= 48 && keyCode <= 57) || (key && key.length === 1 && key.match(/[0-9]/));
  let isSymbol = key === '.' || key === '/' || key === '-' || key === '+' || key === '*' || 
                 key === '(' || key === ')' || key === '#' || key === '!' ||
                 (key && key.length === 1 && key.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/));
  
  if (isLetter || isNumber || isSymbol) {
    
    // Check if adding this character would make the line go outside canvas bounds
    let newLineLength = currentLine.length + 1;
    let newLineWidth = newLineLength * letterSpacing;
    if (newLineWidth > cols - 2) { // Need at least 1 cell margin on each side
      return false; // Don't allow typing - line would be too long, user must press Enter
    }
    
    // Check if text block would be too tall with current lines
    let totalLines = allLines.length + (currentLine.length >= 0 ? 1 : 0);
    let textBlockHeight = totalLines * 11;
    if (textBlockHeight > rows - 2) { // Need at least 1 cell margin on top/bottom
      return false; // Don't allow any more typing - would exceed canvas height
    }
    
    // Convert letters to preserve case, keep numbers and symbols as-is
    if ((keyCode >= 48 && keyCode <= 57) || key === '.' || key === '/' || key === '-' || key === '+' || key === '*' || key === '(' || key === ')' || key === '#' || key === '!') {
      currentLine.push(key);
    } else {
      currentLine.push(key); // Keep original case for both uppercase and lowercase
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
      // Text will be auto-centered, no manual positioning needed
    }
    return false;
  }
  
  // Enter (keyCode 13)  
  if (keyCode === 13) {
    // Check if adding a new line would exceed canvas height
    let totalLines = allLines.length + 1 + (currentLine.length > 0 ? 1 : 0); // +1 for new line, +1 if current line has content
    let textBlockHeight = totalLines * 11;
    if (textBlockHeight > rows - 2) { // Need at least 1 cell margin on top/bottom
      return false; // Don't allow new line - would exceed canvas height
    }
    
    allLines.push([...currentLine]);
    currentLine = [];
    return false;
  }
  
  // Up arrow (keyCode 38) - removed manual positioning
  if (keyCode === 38) {
    // Text is now auto-centered, no manual positioning needed
    return false;
  }
  
  // Down arrow (keyCode 40) - removed manual positioning
  if (keyCode === 40) {
    // Text is now auto-centered, no manual positioning needed
    return false;
  }
  
  // Space (keyCode 32)
  if (keyCode === 32) {
    // Check if adding space would make line too long for canvas bounds
    let letterSpacing = customFontMode ? 15 : (useStardomFont ? 10 : 9);
    let newLineLength = currentLine.length + 1;
    let newLineWidth = newLineLength * letterSpacing;
    if (newLineWidth > cols - 2) { // Need at least 1 cell margin on each side
      return false; // Don't allow space - line would be too long, user must press Enter
    }
    currentLine.push(' ');
    return false;
  }
}

// LAPTOP FIX: Alternative input handler for laptop keyboards
function keyTyped() {
  // This function is called for printable characters and can work better on some laptop keyboards
  console.log("keyTyped called! key:", key);
  
  // Only handle if keyPressed didn't already handle it
  if (key && key.length === 1) {
    let letterSpacing = customFontMode ? 15 : (useStardomFont ? 10 : 9);
    
    // Check for printable characters
    if (key.match(/[a-zA-Z0-9.,\/#!$%\^&\*;:{}=\-_`~()]/)) {
      // Check bounds
      let newLineLength = currentLine.length + 1;
      let newLineWidth = newLineLength * letterSpacing;
      if (newLineWidth <= cols - 2) {
        let totalLines = allLines.length + (currentLine.length >= 0 ? 1 : 0);
        let textBlockHeight = totalLines * 11;
        if (textBlockHeight <= rows - 2) {
          currentLine.push(key);
          console.log("Added character via keyTyped:", key);
          return false;
        }
      }
    }
  }
  return false;
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
  // ClashGrotesk-inspired letter patterns (9x9 grid) - geometric grid-based approach
  let clashPatterns = {
    'A': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
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
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'D': [
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'E': [
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'F': [
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'G': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
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
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,0],
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
      [0,1,1,0,0,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'O': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'P': [
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Q': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'R': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'S': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'T': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'U': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'V': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,1,1,1,1,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'W': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,1,1,1,1,0],
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
    ],
    
    // LOWERCASE LETTERS - ClashGrotesk style (smaller height, geometric)
    'a': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'b': [
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'c': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'd': [
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'e': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'f': [
      [0,0,0,1,1,1,1,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'g': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'h': [
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'i': [
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'j': [
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,0,0,0,1,1,0,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'k': [
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,1,1,0,0,0,0],
      [0,1,1,1,1,0,0,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'l': [
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'm': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'n': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'o': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'p': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'q': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'r': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    's': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,1,1,1,1,0,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,0,1,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    't': [
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,1,1,0],
      [0,0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'u': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'v': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'w': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'x': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'y': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'z': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ]
  };

  // Stardom-inspired letter patterns (9x9 grid) - elegant serif style with decorative strokes
  let stardomPatterns = {
    'A': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'B': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'C': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'D': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,1,1],
      [0,1,1,0,0,0,0,1,1],
      [0,1,1,0,0,0,0,1,1],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'E': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'F': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'G': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'H': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'I': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'J': [
      [0,0,0,0,0,0,0,0,0],
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
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,1,1,0,1,1,0,0,0],
      [0,1,1,0,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'L': [
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'M': [
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,1,0,1,1,1,1],
      [1,1,1,1,1,1,1,1,1],
      [1,1,0,1,1,1,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'N': [
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,1,0,0,1,1,1],
      [1,1,1,1,1,0,1,1,1],
      [1,1,0,1,1,1,1,1,1],
      [1,1,0,1,1,1,1,1,1],
      [1,1,0,0,1,1,1,1,1],
      [1,1,0,0,0,1,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'O': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'P': [
      [1,1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Q': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,0,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,1,0,0,1,1,1,1],
      [0,1,1,1,0,1,1,1,0],
      [0,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'R': [
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,0,0,1,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,0,0,0],
      [1,1,0,0,1,1,1,0,0],
      [1,1,0,0,0,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'S': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'T': [
      [1,1,1,1,1,1,1,1,1],
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
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,0,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'V': [
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,0,0,0,1,1,0],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'W': [
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,1,1,1,0,1,1],
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,1,0,1,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'X': [
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,0,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Y': [
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,0,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'Z': [
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,1,1,1,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    '0': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,0,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,0,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '1': [
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '2': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    '3': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '4': [
      [1,1,1,0,0,1,1,1,0],
      [1,1,0,0,0,1,1,1,0],
      [1,1,0,0,0,1,1,1,0],
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '5': [
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '6': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '7': [
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,1,1,1,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '8': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '9': [
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '.': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '/': [
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,1,1,1,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '-': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '+': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '*': [
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,0,1,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,1,0,1,1,1],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '(': [
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    ')': [
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,1,1,0,0],
      [0,0,0,0,1,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '#': [
      [0,0,1,0,1,0,1,0,0],
      [0,0,1,0,1,0,1,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,1,0,1,0,1,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,1,0,1,0,1,0,0],
      [0,0,1,0,1,0,1,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    '!': [
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    // Lowercase letters for Stardom - elegant serif style with decorative flourishes
    'a': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,1,1,1,1],
      [0,1,1,1,1,1,1,1,1],
      [0,1,1,0,0,0,1,1,0]
    ],
    'b': [
      [1,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,0,0,0]
    ],
    'c': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,1],
      [1,1,0,0,0,0,0,0,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,1,1,0,0,0,1,1,0]
    ],
    'd': [
      [0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,0,1]
    ],
    'e': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,1,1,1,1,1,1,0],
      [1,1,0,0,0,0,0,0,1],
      [1,1,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,0,0,0,0,1,0,0]
    ],
    'f': [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,0,1,0],
      [1,1,1,1,1,1,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,0,0,0,0,0,0,0]
    ],
    'g': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,0,0,0,0,0,0,0]
    ],
    'h': [
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1,0],
      [1,0,0,0,0,0,1,0,0]
    ],
    'i': [
      [0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [1,1,1,1,1,1,0,0,0],
      [1,0,0,0,0,1,0,0,0]
    ],
    'j': [
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [1,1,0,1,1,1,0,0,0],
      [0,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'k': [
      [1,1,1,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,1,1,1,0,0],
      [1,1,0,1,1,1,0,0,0],
      [1,1,1,1,1,0,0,0,0],
      [1,1,1,1,1,0,0,0,0],
      [1,1,0,1,1,1,0,0,0],
      [1,1,1,0,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'l': [
      [0,1,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [0,0,1,1,1,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'm': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,0,1,0,1,1,0],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,1,0,1,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'n': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'o': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'p': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'q': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'r': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,0,0,0,1,1,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    's': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,1,1,0,1],
      [1,1,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,0,0],
      [0,1,0,0,0,0,1,0,0]
    ],
    't': [
      [0,1,1,1,0,0,0,0,0],
      [0,1,1,1,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [0,1,1,1,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0],
      [0,1,1,1,0,0,1,1,0],
      [0,0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'u': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'v': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'w': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,0,1,0,1,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,0,0,1,0,0,1,1],
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'x': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,0,0,0,1,1,0],
      [0,0,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,0,0,0,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ],
    'y': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    'z': [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,1,1,1,0],
      [0,0,0,1,1,1,0,0,0],
      [0,1,1,1,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0]
    ]
  };
  
  // Choose the appropriate pattern set based on font selection
  let patterns;
  if (customFontMode && Object.keys(customFontPatterns).length > 0) {
    patterns = customFontPatterns;
  } else {
    patterns = useStardomFont ? stardomPatterns : clashPatterns;
  }
  
  if (patterns[letter]) {
    let pattern = patterns[letter];
    // Set letter color based on mode
    fill(darkMode ? 255 : 0);
    noStroke();
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 1) {
          // Each letter pixel now spans letterPixelSize x letterPixelSize grid cells
          for (let dy = 0; dy < letterPixelSize; dy++) {
            for (let dx = 0; dx < letterPixelSize; dx++) {
              let gridPosX = gridX + (x * letterPixelSize) + dx;
              let gridPosY = gridY + (y * letterPixelSize) + dy;
              
              // Make sure we don't go outside the grid
              if (gridPosX >= 0 && gridPosX < cols && gridPosY >= 0 && gridPosY < rows) {
                // Calculate position using distorted grid if diagonal modes are active
                let distortedPos = getDistortedPosition(gridPosX, gridPosY);
                let pixelX = distortedPos.x;
                let pixelY = distortedPos.y;
                let cellWidth = colWidths[gridPosX];
                let cellHeight = rowHeights[gridPosY];
                
                if (useCircles) {
                  // Draw circles that automatically connect by overlapping significantly
                  let centerX = pixelX + cellWidth / 2;
                  let centerY = pixelY + cellHeight / 2;
                  // Use the average of width and height to keep circles round
                  let avgCellSize = (cellWidth + cellHeight) / 2;
                  // Apply dynamic scaling if enabled
                  let scaleMultiplier = getShapeScale(gridPosX, gridPosY);
                  // Make circles much bigger (180% of average cell size) to ensure automatic connection
                  let diameter = avgCellSize * 1.8 * scaleMultiplier;
                  
                  if (useOutline) {
                    stroke(darkMode ? 255 : 0);
                    strokeWeight(3);
                    fill(darkMode ? 0 : 255);
                  } else {
                    fill(darkMode ? 255 : 0);
                    noStroke();
                  }
                  
                  ellipse(centerX, centerY, diameter, diameter);
                } else {
                  // Rectangle drawing for bigger letters with scaling support
                  let scaleMultiplier = getShapeScale(gridPosX, gridPosY);
                  let scaledWidth = cellWidth * scaleMultiplier;
                  let scaledHeight = cellHeight * scaleMultiplier;
                  
                  // Center the scaled rectangle
                  let centeredX = pixelX + (cellWidth - scaledWidth) / 2;
                  let centeredY = pixelY + (cellHeight - scaledHeight) / 2;
                  
                  if (useOutline) {
                    stroke(darkMode ? 255 : 0);
                    strokeWeight(3);
                    noFill();
                  } else {
                    fill(darkMode ? 255 : 0);
                    noStroke();
                  }
                  
                  rect(centeredX, centeredY, scaledWidth, scaledHeight);
                }
              }
            }
          }
        }
      }
    }
  }
}

function drawCustomPixel(gridX, gridY) {
  // Draw a photo pixel with scaling support like letters
  for (let dy = 0; dy < letterPixelSize; dy++) {
    for (let dx = 0; dx < letterPixelSize; dx++) {
      let gridPosX = gridX + dx;
      let gridPosY = gridY + dy;
      
      // Make sure we don't go outside the grid
      if (gridPosX >= 0 && gridPosX < cols && gridPosY >= 0 && gridPosY < rows) {
        // Calculate position using distorted grid if diagonal modes are active
        let distortedPos = getDistortedPosition(gridPosX, gridPosY);
        let pixelX = distortedPos.x;
        let pixelY = distortedPos.y;
        let cellWidth = colWidths[gridPosX];
        let cellHeight = rowHeights[gridPosY];
        
        if (useCircles) {
          // Draw circles that automatically connect by overlapping significantly
          let centerX = pixelX + cellWidth / 2;
          let centerY = pixelY + cellHeight / 2;
          // Use the average of width and height to keep circles round
          let avgCellSize = (cellWidth + cellHeight) / 2;
          // Apply dynamic scaling if enabled
          let scaleMultiplier = getShapeScale(gridPosX, gridPosY);
          // Make circles much bigger (180% of average cell size) to ensure automatic connection
          let diameter = avgCellSize * 1.8 * scaleMultiplier;
          
          if (useOutline) {
            stroke(darkMode ? 255 : 0);
            strokeWeight(3);
            fill(darkMode ? 0 : 255);
          } else {
            fill(darkMode ? 255 : 0);
            noStroke();
          }
          
          ellipse(centerX, centerY, diameter, diameter);
        } else {
          // Rectangle drawing for photo pixels with scaling support
          let scaleMultiplier = getShapeScale(gridPosX, gridPosY);
          let scaledWidth = cellWidth * scaleMultiplier;
          let scaledHeight = cellHeight * scaleMultiplier;
          
          // Center the scaled rectangle
          let centeredX = pixelX + (cellWidth - scaledWidth) / 2;
          let centeredY = pixelY + (cellHeight - scaledHeight) / 2;
          
          if (useOutline) {
            stroke(darkMode ? 255 : 0);
            strokeWeight(3);
            noFill();
          } else {
            fill(darkMode ? 255 : 0);
            noStroke();
          }
          
          rect(centeredX, centeredY, scaledWidth, scaledHeight);
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
  fontToggleButton.position(530, 20);
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

function toggleFont() {
  useStardomFont = !useStardomFont;
  if (useStardomFont) {
    fontToggleButton.html('STARDOM');
    fontToggleButton.style('background-color', '#FF69B4'); // Hot pink for Stardom
    fontToggleButton.style('color', 'white');
  } else {
    fontToggleButton.html('CLASH');
    fontToggleButton.style('background-color', '#8B008B'); // Dark magenta for Clash
    fontToggleButton.style('color', 'white');
  }
}

function toggleOutline() {
  useOutline = !useOutline;
  if (useOutline) {
    outlineToggleButton.html('OUTLINE');
    outlineToggleButton.style('background-color', '#8BC34A'); // Green for outline mode
    outlineToggleButton.style('color', 'black');
  } else {
    outlineToggleButton.html('FILLED');
    outlineToggleButton.style('background-color', '#795548'); // Brown for filled mode
    outlineToggleButton.style('color', 'white');
  }
}

function toggleLetterSize() {
  if (letterSizeMode === "Small") {
    letterSizeMode = "Normal";
    letterPixelSize = 1;
    window.letterSizeButton.html('SIZE: Normal');
  } else if (letterSizeMode === "Normal") {
    letterSizeMode = "Large";
    letterPixelSize = 2; // Each letter pixel takes 2x2 grid cells
    window.letterSizeButton.html('SIZE: Large');
  } else if (letterSizeMode === "Large") {
    letterSizeMode = "XLarge";
    letterPixelSize = 3; // Each letter pixel takes 3x3 grid cells
    window.letterSizeButton.html('SIZE: XLarge');
  } else {
    letterSizeMode = "Small";
    letterPixelSize = 1;
    window.letterSizeButton.html('SIZE: Small');
  }
}



function togglePhotoMode() {
  if (!photoMode) {
    // Trigger file selection
    photoInput.elt.click();
  } else {
    // Turn off photo mode
    photoMode = false;
    photoButton.html('PHOTO: OFF');
    photoButton.style('background-color', '#607D8B'); // Blue Grey when inactive
    photoPixels = []; // Clear photo pixels
  }
}

function toggleCustomFont() {
  if (!customFontMode) {
    // Trigger font file selection
    customFontInput.elt.click();
  } else {
    // Turn off custom font mode
    customFontMode = false;
    customFontButton.html('FONT: BUILT-IN');
    customFontButton.style('background-color', '#3F51B5'); // Indigo when inactive
    customFontPatterns = {}; // Clear custom patterns
  }
}

function handlePhotoUpload(file) {
  if (file.type === 'image') {
    // Load the image
    loadedImage = loadImage(file.data, processPhotoToGrid);
  } else {
    alert('Please select an image file (JPG, PNG, GIF, etc.)');
  }
}

function processPhotoToGrid() {
  if (!loadedImage) return;
  
  // Clear existing content
  allLines = [];
  currentLine = [];
  customDrawing = [];
  photoPixels = [];
  
  // Turn off other modes
  brushMode = false;
  // Note: brushButton removed from this version
  
  // Activate photo mode
  photoMode = true;
  photoButton.html('PHOTO: ON');
  photoButton.style('background-color', '#4CAF50'); // Green when active
  
  // Calculate scale to fit image to grid
  let maxWidth = Math.floor(cols * 0.8); // Use 80% of grid width
  let maxHeight = Math.floor(rows * 0.8); // Use 80% of grid height
  
  let scaleX = maxWidth / loadedImage.width;
  let scaleY = maxHeight / loadedImage.height;
  let scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio
  
  let scaledWidth = Math.floor(loadedImage.width * scale);
  let scaledHeight = Math.floor(loadedImage.height * scale);
  
  // Center the image on the grid
  let startX = Math.floor((cols - scaledWidth) / 2);
  let startY = Math.floor((rows - scaledHeight) / 2);
  
  // Process image pixel by pixel
  loadedImage.loadPixels();
  
  for (let y = 0; y < scaledHeight; y++) {
    for (let x = 0; x < scaledWidth; x++) {
      // Map grid position back to original image coordinates
      let imgX = Math.floor(x / scale);
      let imgY = Math.floor(y / scale);
      
      // Get pixel color from original image
      let pixelIndex = (imgY * loadedImage.width + imgX) * 4;
      let r = loadedImage.pixels[pixelIndex];
      let g = loadedImage.pixels[pixelIndex + 1];
      let b = loadedImage.pixels[pixelIndex + 2];
      
      // Convert to grayscale
      let gray = (r + g + b) / 3;
      
      // If pixel is darker than threshold, add it to photoPixels
      if (gray < photoBrightness) {
        let gridX = startX + x;
        let gridY = startY + y;
        
        // Make sure we're within grid bounds
        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
          let pixelKey = gridX + ',' + gridY;
          if (!photoPixels.includes(pixelKey)) {
            photoPixels.push(pixelKey);
          }
        }
      }
    }
  }
  
  console.log(`Photo processed: ${photoPixels.length} pixels created from ${scaledWidth}x${scaledHeight} scaled image`);
}

function handleFontUpload(file) {
  // Check if it's a font file
  if (file.name.toLowerCase().endsWith('.ttf') || 
      file.name.toLowerCase().endsWith('.otf') || 
      file.name.toLowerCase().endsWith('.woff') || 
      file.name.toLowerCase().endsWith('.woff2')) {
    
    // Load the font file
    customFont = loadFont(file.data, processFontToPatterns, fontLoadError);
  } else {
    alert('Please select a font file (.ttf, .otf, .woff, or .woff2)');
  }
}

function fontLoadError() {
  alert('Error loading font file. Please make sure it\'s a valid font file.');
  customFontMode = false;
  customFontButton.html('FONT: BUILT-IN');
  customFontButton.style('background-color', '#3F51B5');
}

function processFontToPatterns() {
  if (!customFont) return;
  
  customFontPatterns = {};
  
  // Activate custom font mode
  customFontMode = true;
  customFontButton.html('FONT: CUSTOM');
  customFontButton.style('background-color', '#4CAF50'); // Green when active
  
  // Create a temporary graphics buffer to render characters
  let tempGraphics = createGraphics(fontRenderSize * 2, fontRenderSize * 2);
  
  // FIX: Explicitly set pixel density to 1 to ensure consistent rendering across all displays
  // This prevents issues when switching between Retina and non-Retina displays
  tempGraphics.pixelDensity(1);
  
  // Target pattern size (13x13 for custom fonts - more detail)
  let patternSize = 13;
  
  // Process each character
  for (let i = 0; i < charactersToGenerate.length; i++) {
    let char = charactersToGenerate.charAt(i);
    
    // Clear the temporary graphics
    tempGraphics.clear();
    tempGraphics.background(255, 255, 255, 0); // Transparent background
    
    // Set up text rendering
    tempGraphics.textFont(customFont);
    tempGraphics.textSize(fontRenderSize);
    tempGraphics.textAlign(CENTER, CENTER);
    tempGraphics.fill(0); // Black text
    tempGraphics.noStroke();
    
    // Render the character
    tempGraphics.text(char, fontRenderSize, fontRenderSize);
    
    // Load pixels from the graphics buffer
    tempGraphics.loadPixels();
    
    // Find the bounding box of the character
    let minX = tempGraphics.width, maxX = 0;
    let minY = tempGraphics.height, maxY = 0;
    let hasPixels = false;
    
    for (let y = 0; y < tempGraphics.height; y++) {
      for (let x = 0; x < tempGraphics.width; x++) {
        let index = (y * tempGraphics.width + x) * 4;
        let alpha = tempGraphics.pixels[index + 3];
        
        if (alpha > fontThreshold * 255) {
          hasPixels = true;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // Create the 9x9 pattern
    let pattern = [];
    for (let y = 0; y < patternSize; y++) {
      pattern[y] = [];
      for (let x = 0; x < patternSize; x++) {
        pattern[y][x] = 0; // Default to empty
      }
    }
    
    // If character has pixels, sample from it
    if (hasPixels) {
      let charWidth = maxX - minX + 1;
      let charHeight = maxY - minY + 1;
      
      for (let y = 0; y < patternSize; y++) {
        for (let x = 0; x < patternSize; x++) {
          // Map pattern coordinates to character coordinates
          let sampleX = Math.floor(minX + (x / (patternSize - 1)) * (charWidth - 1));
          let sampleY = Math.floor(minY + (y / (patternSize - 1)) * (charHeight - 1));
          
          // Make sure we're within bounds
          if (sampleX >= 0 && sampleX < tempGraphics.width && 
              sampleY >= 0 && sampleY < tempGraphics.height) {
            
            let index = (sampleY * tempGraphics.width + sampleX) * 4;
            let alpha = tempGraphics.pixels[index + 3];
            
            // If pixel has sufficient alpha, mark as filled
            pattern[y][x] = alpha > fontThreshold * 255 ? 1 : 0;
          }
        }
      }
    }
    
    customFontPatterns[char] = pattern;
  }
  
  // Add space character as empty pattern
  customFontPatterns[' '] = [];
  for (let y = 0; y < patternSize; y++) {
    customFontPatterns[' '][y] = [];
    for (let x = 0; x < patternSize; x++) {
      customFontPatterns[' '][y][x] = 0; // All empty for space
    }
  }
  
  // Also create lowercase versions for letters
  for (let i = 0; i < 26; i++) {
    let upperChar = String.fromCharCode(65 + i); // A-Z
    let lowerChar = String.fromCharCode(97 + i); // a-z
    if (customFontPatterns[upperChar] && !customFontPatterns[lowerChar]) {
      customFontPatterns[lowerChar] = customFontPatterns[upperChar];
    }
  }
  
  // Clean up
  tempGraphics.remove();
  
  console.log(`Custom font processed: ${Object.keys(customFontPatterns).length} characters created`);
  console.log('Font name:', customFont.font ? customFont.font.names.fontFamily : 'Unknown');
  console.log('Available characters:', Object.keys(customFontPatterns).join(''));
}

function toggleShapeScaling() {
  if (!shapeScaling) {
    shapeScaling = true;
    shapeScaleButton.html('SCALE: ' + shapeScaleMode.toUpperCase());
    shapeScaleButton.style('background-color', '#4CAF50'); // Green when active
  } else {
    // Cycle through scaling modes
    if (shapeScaleMode === "pulse") {
      shapeScaleMode = "wave";
    } else if (shapeScaleMode === "wave") {
      shapeScaleMode = "random";
    } else if (shapeScaleMode === "random") {
      shapeScaleMode = "breathing";
    } else if (shapeScaleMode === "breathing") {
      shapeScaleMode = "ripple";
    } else {
      shapeScaling = false;
      shapeScaleMode = "pulse";
      shapeScaleButton.html('SCALE: OFF');
      shapeScaleButton.style('background-color', '#FF5722'); // Deep Orange when inactive
      return;
    }
    shapeScaleButton.html('SCALE: ' + shapeScaleMode.toUpperCase());
  }
}

function getShapeScale(gridX, gridY) {
  if (!shapeScaling) return baseShapeScale;
  
  let scale = baseShapeScale;
  
  switch (shapeScaleMode) {
    case "pulse":
      // All shapes pulse together
      scale = baseShapeScale + sin(scaleTime * 2) * 0.5;
      break;
      
    case "wave":
      // Wave effect across the grid
      let waveX = sin(scaleTime * 1.5 + gridX * 0.3) * 0.4;
      let waveY = cos(scaleTime * 1.2 + gridY * 0.25) * 0.3;
      scale = baseShapeScale + waveX + waveY;
      break;
      
    case "random":
      // Each shape has its own random pulse - slower and more organic
      let seed = gridX * 100 + gridY;
      let randomScale = sin(scaleTime * 1.2 + seed * 0.1) * 0.6;
      scale = baseShapeScale + randomScale;
      break;
      
    case "breathing":
      // Slow, organic breathing effect
      let breathe = sin(scaleTime * 0.8) * 0.7;
      let individualVariation = sin(gridX * 0.1 + gridY * 0.15) * 0.2;
      scale = baseShapeScale + breathe + individualVariation;
      break;
      
    case "ripple":
      // Ripple effect from center of screen
      let centerX = cols / 2;
      let centerY = rows / 2;
      let distance = sqrt((gridX - centerX) * (gridX - centerX) + (gridY - centerY) * (gridY - centerY));
      let ripple = sin(scaleTime * 2 - distance * 0.2) * 0.6;
      scale = baseShapeScale + ripple;
      break;
  }
  
  // Clamp scale to reasonable bounds
  return constrain(scale, minShapeScale, maxShapeScale);
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

function updateButtonStyles() {
  // Button styles are now handled individually in their toggle functions
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

// Helper function to check if there's a letter at adjacent grid position
function hasAdjacentLetter(gridX, gridY) {
  // Check current line
  if (gridY === currentRow / 7 && gridX < currentLine.length) {
    return true;
  }
  
  // Check all completed lines
  let lineIndex = Math.floor((gridY * 7 - 3) / 11); // Convert grid Y to line index
  if (lineIndex >= 0 && lineIndex < allLines.length) {
    let letterIndex = Math.floor((gridX * 6 - 3) / 6); // Convert grid X to letter index
    return letterIndex >= 0 && letterIndex < allLines[lineIndex].length;
  }
  
  return false;
}
