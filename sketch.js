let game, grid, cursor, dotField;
let gridOpacity = 255;
let textFormed = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255, 255, 255, 255);

  game = new Game();
  grid = new Grid(width, height);
  cursor = new Cursor();
  dotField = new DotField();
}

function draw() {
  // Dark background
  background(42, 42, 62);

  // Update and draw dots (bottom layer)
  dotField.update(mouseX, mouseY);
  dotField.draw();

  // State machine transitions
  if (game.state === 'win' || game.state === 'draw') {
    if (gridOpacity > 0) {
      gridOpacity = Math.max(0, gridOpacity - 8);
      if (gridOpacity === 0 && !textFormed) {
        const word = game.state === 'win' ? 'YOU WON!' : 'DRAW';
        dotField.rebuildWithSpacing(16);
        dotField.formText(word);
        textFormed = true;
      }
    }
  }

  if (game.state === 'resetting') {
    if (gridOpacity < 255) {
      gridOpacity = Math.min(255, gridOpacity + 8);
    }
    if (gridOpacity >= 255 && dotField.allNearHome()) {
      game.reset();
      cursor.active = false;
      dotField.rebuild();
      // state is now 'playing' after reset
    }
  }

  // Cursor highlight (between dots and grid)
  if (game.state === 'playing') {
    cursor.draw(grid);
  }

  // Grid on top
  grid.draw(game.board, game.winCells, gridOpacity);

  // Player turn indicator
  if (game.state === 'playing') {
    drawTurnIndicator();
  } else if ((game.state === 'win' || game.state === 'draw') && gridOpacity > 0) {
    drawTurnIndicator();
  }

  // Prompt to reset
  if ((game.state === 'win' || game.state === 'draw') && textFormed) {
    drawResetPrompt();
  }
}

function drawTurnIndicator() {
  push();
  textAlign(LEFT, TOP);
  textSize(18);
  noStroke();
  fill(255, 255, 255, 180);
  text("Player: " + game.currentPlayer, 20, 20);
  pop();
}

function drawResetPrompt() {
  push();
  textAlign(CENTER, BOTTOM);
  textSize(20);
  noStroke();
  fill(255, 255, 255, 180);
  text("Press ENTER to play again", width / 2, height - 20);
  pop();
}

function attemptPlacement(row, col) {
  if (game.state !== 'playing') return;
  const placed = game.placeMarker(row, col);
  if (placed) {
    const { px, py } = grid.cellCenter(row, col);
    dotField.onMarkerPlaced(px, py);

    // If game ended, prep for fade
    if (game.state === 'win' || game.state === 'draw') {
      textFormed = false;
    }
  }
}

function mouseClicked() {
  if (game.state !== 'playing') return;
  const cell = grid.cellAt(mouseX, mouseY);
  if (cell) {
    attemptPlacement(cell.row, cell.col);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    if (game.state === 'playing') { cursor.activate(); cursor.move('up'); }
    return false;
  }
  if (keyCode === DOWN_ARROW) {
    if (game.state === 'playing') { cursor.activate(); cursor.move('down'); }
    return false;
  }
  if (keyCode === LEFT_ARROW) {
    if (game.state === 'playing') { cursor.activate(); cursor.move('left'); }
    return false;
  }
  if (keyCode === RIGHT_ARROW) {
    if (game.state === 'playing') { cursor.activate(); cursor.move('right'); }
    return false;
  }

  if (keyCode === ENTER || keyCode === RETURN) {
    if (game.state === 'playing' && cursor.active) {
      attemptPlacement(cursor.row, cursor.col);
    } else if (game.state === 'win' || game.state === 'draw') {
      // Begin reset
      game.state = 'resetting';
      dotField.returnToField();
      gridOpacity = 0;
    }
    return false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  grid.reposition(width, height);
  dotField.rebuild();
}
