let dotField, menu;
let game = null, grid = null, cursor = null;
let appState = 'menu'; // 'menu'|'starting'|'playing'|'win'|'draw'|'resetting'
let gridOpacity = 0;
let menuOpacity = 255;
let textFormed = false;
let pendingSize = 6;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255, 255, 255, 255);

  dotField = new DotField();
  menu = new Menu();
  menu.computeLayout(height / 2);
  dotField.formMenuClearance(menu.getBoundingRect());
}

function draw() {
  background(42, 42, 62);

  dotField.update(mouseX, mouseY);
  dotField.draw();

  _updateStateTransitions();

  if (appState === 'menu' || appState === 'starting') {
    menu.draw(menuOpacity, height / 2);
  }

  if (appState === 'playing') {
    cursor.draw(grid);
  }

  if (game && appState !== 'menu') {
    grid.draw(game.board, game.winCells, gridOpacity);
  }

  if (appState === 'playing') {
    drawTurnIndicator();
  } else if ((appState === 'win' || appState === 'draw') && gridOpacity > 0) {
    drawTurnIndicator();
  }

  if ((appState === 'win' || appState === 'draw') && textFormed) {
    menu.draw(255, height * 0.8);
  }
}

function _updateStateTransitions() {
  if (appState === 'starting' || appState === 'resetting') {
    menuOpacity = Math.max(0, menuOpacity - 8);
    gridOpacity = Math.min(255, gridOpacity + 8);
    if (gridOpacity >= 255 && dotField.allNearHome()) {
      _createGame(pendingSize);
    }
  }

  if (appState === 'win' || appState === 'draw') {
    if (gridOpacity > 0) {
      gridOpacity = Math.max(0, gridOpacity - 8);
      if (gridOpacity === 0 && !textFormed) {
        const word = appState === 'win' ? 'YOU WON!' : 'DRAW';
        dotField.rebuildWithSpacing(16);
        dotField.formText(word);
        textFormed = true;
      }
    }
  }
}

function _createGame(size) {
  const winLength = size <= 4 ? 3 : 4;
  game = new Game(size, winLength);
  grid = new Grid(width, height, size);
  cursor = new Cursor(size);
  cursor.active = false;
  dotField.rebuild();
  gridOpacity = 255;
  menuOpacity = 0;
  textFormed = false;
  menu.selectedIndex = -1;
  appState = 'playing';
}

function _selectSize(option) {
  pendingSize = option.size;
  dotField.returnToField();
  gridOpacity = 0;
  if (appState === 'menu') {
    appState = 'starting';
  } else {
    appState = 'resetting';
    menuOpacity = 0;
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

function attemptPlacement(row, col) {
  if (appState !== 'playing') return;
  const placed = game.placeMarker(row, col);
  if (placed) {
    const { px, py } = grid.cellCenter(row, col);
    dotField.onMarkerPlaced(px, py);

    if (game.state === 'win' || game.state === 'draw') {
      appState = game.state;
      textFormed = false;
    }
  }
}

function mouseClicked() {
  const menuVisible = appState === 'menu' ||
    ((appState === 'win' || appState === 'draw') && textFormed);

  if (menuVisible) {
    const idx = menu.optionAt(mouseX, mouseY);
    if (idx >= 0) {
      _selectSize(menu.options[idx]);
      return;
    }
  }

  if (appState === 'playing') {
    const cell = grid.cellAt(mouseX, mouseY);
    if (cell) attemptPlacement(cell.row, cell.col);
  }
}

function mouseMoved() {
  const menuVisible = appState === 'menu' ||
    ((appState === 'win' || appState === 'draw') && textFormed);
  if (menuVisible) menu.updateHover(mouseX, mouseY);
}

function touchStarted() {
  const menuVisible = appState === 'menu' ||
    ((appState === 'win' || appState === 'draw') && textFormed);

  if (menuVisible) {
    const idx = menu.optionAt(mouseX, mouseY);
    if (idx >= 0) {
      _selectSize(menu.options[idx]);
      return false;
    }
  }

  if (appState === 'playing') {
    const cell = grid.cellAt(mouseX, mouseY);
    if (cell) attemptPlacement(cell.row, cell.col);
  }

  return false;
}

function touchMoved() {
  return false;
}

function keyPressed() {
  const menuVisible = appState === 'menu' ||
    ((appState === 'win' || appState === 'draw') && textFormed);

  if (menuVisible) {
    if (keyCode === LEFT_ARROW) { menu.moveLeft(); return false; }
    if (keyCode === RIGHT_ARROW) { menu.moveRight(); return false; }
    if (keyCode === ENTER || keyCode === RETURN) {
      if (menu.selectedIndex >= 0) _selectSize(menu.options[menu.selectedIndex]);
      return false;
    }
  }

  if (appState === 'playing') {
    if (keyCode === UP_ARROW) { cursor.activate(); cursor.move('up'); return false; }
    if (keyCode === DOWN_ARROW) { cursor.activate(); cursor.move('down'); return false; }
    if (keyCode === LEFT_ARROW) { cursor.activate(); cursor.move('left'); return false; }
    if (keyCode === RIGHT_ARROW) { cursor.activate(); cursor.move('right'); return false; }
    if (keyCode === ENTER || keyCode === RETURN) {
      if (cursor.active) attemptPlacement(cursor.row, cursor.col);
      return false;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (grid) grid.reposition(width, height);
  if (appState === 'menu') {
    menu.computeLayout(height / 2);
    dotField.rebuild();
    dotField.formMenuClearance(menu.getBoundingRect());
  } else {
    dotField.rebuild();
  }
}
