// Gentrification automata core — ~40 lines.
// Grid = rents 0..1 (grey studios -> white galleries).
// Rule: expensive neighbours pull your rent up.

const Automata = {
  cols: 48,
  rows: 48,
  rent: [],
  pressure: 0.035, // gentrification pressure per step
  seedBlobs: 4,

  init(cols = 48, rows = 48) {
    this.cols = cols;
    this.rows = rows;
    this.rent = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0.08 + Math.random() * 0.12),
    );
    for (let i = 0; i < this.seedBlobs; i++) this.seedGallery();
  },

  seedGallery() {
    const cx = (Math.random() * this.cols) | 0;
    const cy = (Math.random() * this.rows) | 0;
    for (let y = -2; y <= 2; y++)
      for (let x = -2; x <= 2; x++)
        if (this.inBounds(cx + x, cy + y)) this.rent[cy + y][cx + x] = 0.9;
  },

  inBounds: (x, y) => x >= 0 && y >= 0 && x < Automata.cols && y < Automata.rows,

  richNeighbours(x, y) {
    let n = 0;
    for (let j = -1; j <= 1; j++)
      for (let i = -1; i <= 1; i++) {
        if (!i && !j) continue;
        const nx = x + i;
        const ny = y + j;
        if (this.inBounds(nx, ny) && this.rent[ny][nx] > 0.6) n++;
      }
    return n;
  },

  step() {
    const next = this.rent.map((row, y) =>
      row.map((r, x) => {
        const rich = this.richNeighbours(x, y);
        return Math.min(1, r + rich * this.pressure * (0.4 + r) + 0.0015);
      }),
    );
    this.rent = next;
  },
};
