class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: 6 }, () => Array(6).fill(null));
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
      if (cells.length >= 4) return cells.slice(0, 4);
    }
    return null;
  }

  checkDraw() {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (this.board[r][c] === null) return false;
      }
    }
    return true;
  }

  _inBounds(r, c) {
    return r >= 0 && r < 6 && c >= 0 && c < 6;
  }
}
