// Generates assets/ring.wav for the fake call: the Indian double ring
// (400 + 450 Hz, on 0.4 s, off 0.2 s, on 0.4 s, off 2 s), one cycle that loops.
// Kept in the repo so the binary asset is reproducible and auditable.
// Run: node scripts/make-ring.mjs
import { writeFileSync } from "node:fs";

const rate = 22050;
const seconds = 3;
const n = rate * seconds;
const pcm = Buffer.alloc(n * 2);
const ramp = Math.floor(rate * 0.008);
const bursts = [
  [0, 0.4],
  [0.6, 1.0],
];

for (let i = 0; i < n; i++) {
  const t = i / rate;
  const burst = bursts.find(([a, b]) => t >= a && t < b);
  if (!burst) continue;
  const from = Math.floor(burst[0] * rate);
  const to = Math.floor(burst[1] * rate);
  const edge = Math.min(1, (i - from) / ramp, (to - 1 - i) / ramp);
  const v = 0.35 * (Math.sin(2 * Math.PI * 400 * t) + Math.sin(2 * Math.PI * 450 * t));
  pcm.writeInt16LE(Math.round(v * edge * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

writeFileSync(new URL("../assets/ring.wav", import.meta.url), Buffer.concat([header, pcm]));
console.log(`assets/ring.wav written (${44 + pcm.length} bytes)`);
