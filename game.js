class Game {
  constructor(gridSize = 6, winLength = 4) {
    this.gridSize = gridSize;
    this.winLength = winLength;
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
    this.currentPlayer = 'O';
    this.state = 'playing';
    this.winner = null;
    this.winCells = [];
  }

  placeMarker(row, col) {
    if (this.state !== 'playing') return false;
    if (this.board[row][col] !== null) return false;

    this.board[row][col] = this.currentPlayer;

    const win = this.checkWin(row, col);
    if (win) {
      this.winCells = win;
      this.winner = this.currentPlayer;
      this.state = 'win';
      return true;
    }

    if (this.checkDraw()) {
      this.state = 'draw';
      return true;
    }

    this.currentPlayer = this.currentPlayer === 'O' ? 'X' : 'O';
    return true;
  }

  checkWin(row, col) {
    const dirs = [
      [[0, 1], [0, -1]],
      [[1, 0], [-1, 0]],
      [[1, 1], [-1, -1]],
      [[1, -1], [-1, 1]]
    ];
    const player = this.board[row][col];

    for (let [a, b] of dirs) {
      let cells = [{ row, col }];
      for (let [dr, dc] of [a, b]) {
        let r = row + dr, c = col + dc;
        while (this._inBounds(r, c) && this.board[r][c] === player) {
          cells.push({ row: r, col: c });
          r += dr;
          c += dc;
        }
      }
      if (cells.length >= this.winLength) return cells.slice(0, this.winLength);
    }
    return null;
  }

  checkDraw() {
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.board[r][c] === null) return false;
      }
    }
    return true;
  }

  _inBounds(r, c) {
    return r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize;
  }
}
