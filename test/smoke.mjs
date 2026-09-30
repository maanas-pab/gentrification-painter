// Headless smoke test: rent must spread, artists must displace.
// Run: node test/smoke.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../js/automata.js", import.meta.url), "utf8");
const Automata = new Function(`${src}; return Automata;`)();

Automata.init(24, 24);
const start = Automata.rent.flat().filter((r) => r > 0.6).length;
for (let i = 0; i < 120; i++) Automata.step();
const end = Automata.rent.flat().filter((r) => r > 0.6).length;

// Fake artists
let displaced = 0;
for (let i = 0; i < 100; i++) {
  const income = 0.25 + Math.random() * 0.35;
  const rent = Automata.rent[(Math.random() * 24) | 0][(Math.random() * 24) | 0];
  if (rent > income) displaced++;
}

console.log(`gentrified cells: ${start} -> ${end}`);
console.log(`sample displaced: ${displaced}/100`);
if (!(end > start)) throw new Error("FAIL: gentrification did not spread");
if (!(displaced > 10)) throw new Error("FAIL: nobody got displaced — too gentle");
console.log("SMOKE OK");
