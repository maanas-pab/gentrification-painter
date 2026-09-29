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
  }
};

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
        <label>Pressure <input id="pressure" type="range" min="5" max="90" value="35" /></label>
        <button id="pause">Pause</button>
        <button id="reset">Re-seed</button>
      </div>
      <p class="hint">Drag pressure up to gentrify faster. Reset brings the artists back.</p>
    </div>`;
  document.getElementById("pressure").oninput = (e) => {
    Automata.pressure = e.target.value / 1000;
  };
  document.getElementById("pause").onclick = (e) => {
    window.__paused = !window.__paused;
    e.target.textContent = window.__paused ? "Play" : "Pause";
  };
  document.getElementById("reset").onclick = () => {
    Automata.init(48, 48);
    seedArtists(220);
    window.__events = [];
  };
}

document.addEventListener("DOMContentLoaded", buildUI);
