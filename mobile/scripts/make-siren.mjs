// Generates assets/siren.wav: a two-second wailing tone that loops.
// Kept in the repo so the binary asset is reproducible and auditable.
// Run: node scripts/make-siren.mjs
import { writeFileSync } from "node:fs";

const rate = 22050;
const seconds = 2;
const n = rate * seconds;
const pcm = Buffer.alloc(n * 2);
const fade = Math.floor(rate * 0.01);

let phase = 0;
for (let i = 0; i < n; i++) {
  const t = i / rate;
  // One full wail per loop: 700 Hz up to 1500 Hz and back.
  const freq = 1100 - 400 * Math.cos((2 * Math.PI * t) / seconds);
  phase += (2 * Math.PI * freq) / rate;
  const edge = Math.min(1, i / fade, (n - 1 - i) / fade);
  pcm.writeInt16LE(Math.round(Math.sin(phase) * 0.9 * edge * 32767), i * 2);
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

writeFileSync(new URL("../assets/siren.wav", import.meta.url), Buffer.concat([header, pcm]));
console.log(`assets/siren.wav written (${44 + pcm.length} bytes)`);
