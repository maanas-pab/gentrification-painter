// UI wiring: pause / reset / pressure. No framework, just DOM.
window.__paused = false;
window.__events = [];

window.__logEvent = (e) => {
  window.__events.push(e);
  if (window.__events.length > 2000) window.__events.shift();
};

window.__stats = ({ gentrified, alive, displaced }) => {
  const g = document.getElementById("stat-g");
  if (g) {
    g.textContent = `${((gentrified / (48 * 48)) * 100).toFixed(1)}%`;
    document.getElementById("stat-a").textContent = String(alive);
    document.getElementById("stat-d").textContent = String(displaced);
    window.__history = window.__history || [];
    window.__history.push(alive);
    if (window.__history.length > 220) window.__history.shift();
    drawSpark();
  }
};

function drawSpark() {
  const c = document.getElementById("spark");
  if (!c) return;
  const ctx = c.getContext("2d");
  const h = window.__history || [];
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.beginPath();
  h.forEach((v, i) => {
    const x = (i / 220) * c.width;
    const y = c.height - (v / 260) * c.height;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = "#a8a5a0";
  ctx.font = "11px sans-serif";
  ctx.fillText("artists alive →", 8, 14);
}

function buildUI() {
  const el = document.getElementById("ui");
  el.innerHTML = `
    <div class="panel">
      <div class="row stats">
        <div><label>Gentrified</label><b id="stat-g">0%</b></div>
        <div><label>Artists left</label><b id="stat-a">–</b></div>
        <div><label>Displaced</label><b id="stat-d">0</b></div>
      </div>
      <div class="row">
        <label>Neighborhood
          <select id="preset">
            <option value="kreuzberg">Kreuzberg / tipping point</option>
            <option value="soho">SoHo / slow burn</option>
            <option value="hyper">Hyper / flashover</option>
          </select>
        </label>
        <label>Pressure <input id="pressure" type="range" min="5" max="90" value="35" /></label>
        <button id="pause">Pause</button>
        <button id="reset">Re-seed</button>
        <button id="csv" title="Download displacement log">CSV</button>
      </div>
      <canvas id="spark" width="880" height="56"></canvas>
      <p class="hint">Drag pressure up to gentrify faster. Reset brings the artists back. CSV downloads every displacement (x, y, rent, income, tick).</p>
    </div>`;
  document.getElementById("pressure").oninput = (e) => {
    Automata.pressure = e.target.value / 1000;
  };
  document.getElementById("pause").onclick = (e) => {
    window.__paused = !window.__paused;
    e.target.textContent = window.__paused ? "Play" : "Pause";
  };
  const applyPreset = (id) => {
    const map = {
      soho: { pressure: 0.022, artists: 260, seedBlobs: 2 },
      kreuzberg: { pressure: 0.035, artists: 220, seedBlobs: 4 },
      hyper: { pressure: 0.06, artists: 180, seedBlobs: 7 },
    };
    const p = map[id] || map.kreuzberg;
    Automata.pressure = p.pressure;
    Automata.seedBlobs = p.seedBlobs;
    document.getElementById("pressure").value = Math.round(p.pressure * 1000);
    Automata.init(48, 48);
    seedArtists(p.artists);
    window.__events = [];
    window.__history = [];
  };
  document.getElementById("preset").onchange = (e) => applyPreset(e.target.value);
  document.getElementById("reset").onclick = () => applyPreset(document.getElementById("preset").value);
  document.getElementById("csv").onclick = () => {
    const rows = ["x,y,rent,income,tick", ...window.__events.map((e) => `${e.x},${e.y},${e.rent.toFixed(3)},${e.income.toFixed(3)},${e.t}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "displacement-log.csv";
    a.click();
  };
}

document.addEventListener("DOMContentLoaded", buildUI);
