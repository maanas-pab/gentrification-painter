// Rendering + artists. p5 draws rents as grey->white, artists as color dots.
let artists = [];
let displaced = 0;
let cell = 12;
const PALETTE = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#c77dff"];

function setup() {
  const c = createCanvas(576, 576);
  c.parent("stage");
  c.elt.setAttribute("role", "img");
  c.elt.setAttribute("aria-label", "Grid neighborhood gentrifying from grey to white, colored artist dots disappearing");
  Automata.init(48, 48);
  seedArtists(220);
  frameRate(12);
  noStroke();
}

function keyPressed() {
  if (key === " ") {
    window.__paused = !window.__paused;
    const b = document.getElementById("pause");
    if (b) b.textContent = window.__paused ? "Play" : "Pause";
    return false;
  }
  if (key === "r" || key === "R") document.getElementById("reset")?.click();
}

function seedArtists(n) {
  artists = [];
  for (let i = 0; i < n; i++) {
    artists.push({
      x: (Math.random() * Automata.cols) | 0,
      y: (Math.random() * Automata.rows) | 0,
      income: 0.25 + Math.random() * 0.35, // most can't afford >0.6
      col: random(PALETTE),
      alive: true,
    });
  }
  displaced = 0;
}

function draw() {
  if (!window.__paused) Automata.step();
  background(20);

  cell = width / Automata.cols;
  for (let y = 0; y < Automata.rows; y++) {
    for (let x = 0; x < Automata.cols; x++) {
      const r = Automata.rent[y][x];
      fill(lerpColor(color("#3a3a3f"), color("#faf9f6"), r));
      rect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      if (r > 0.75) {
        fill(255, 255, 255, 28);
        rect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }
  }

  // artists: displaced when rent > income
  for (const a of artists) {
    if (!a.alive) continue;
    const rent = Automata.rent[a.y][a.x];
    if (rent > a.income) {
      a.alive = false;
      displaced++;
      window.__logEvent?.({ x: a.x, y: a.y, rent, income: a.income, t: frameCount });
      continue;
    }
    fill(a.col);
    circle((a.x + 0.5) * cell, (a.y + 0.5) * cell, cell * 0.62);
  }

  window.__stats?.({
    gentrified: Automata.rent.flat().filter((r) => r > 0.6).length,
    alive: artists.filter((a) => a.alive).length,
    displaced,
  });
}
