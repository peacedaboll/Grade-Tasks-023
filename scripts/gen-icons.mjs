import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function encodePng(width, height, pixels) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const TOP = [0x1d, 0x4e, 0xd8];
const BOT = [0x3b, 0x82, 0xf6];
const WHITE = [0xff, 0xff, 0xff];
const BAR = [0x1e, 0x40, 0xb8];

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function inRoundRect(x, y, x0, y0, w, h, r) {
  const nx = clamp(x, x0 + r, x0 + w - r);
  const ny = clamp(y, y0 + r, y0 + h - r);
  const dx = x - nx;
  const dy = y - ny;
  return dx * dx + dy * dy <= r * r;
}

function renderIcon(n) {
  const pixels = Buffer.alloc(n * n * 4);
  const card = { x0: 0.18, y0: 0.2, w: 0.64, h: 0.6, r: 0.09 };
  const bars = [
    { x0: 0.3, y0: 0.32, w: 0.4, h: 0.055, r: 0.0275 },
    { x0: 0.3, y0: 0.4, w: 0.4, h: 0.055, r: 0.0275 },
    { x0: 0.3, y0: 0.48, w: 0.26, h: 0.055, r: 0.0275 }
  ];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const acc = [0, 0, 0];
      for (const [sx, sy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        const px = (x + sx) / n;
        const py = (y + sy) / n;
        let color = lerp(TOP, BOT, py);
        if (inRoundRect(px, py, card.x0, card.y0, card.w, card.h, card.r)) {
          let onBar = false;
          for (const b of bars) {
            if (inRoundRect(px, py, b.x0, b.y0, b.w, b.h, b.r)) {
              onBar = true;
              break;
            }
          }
          color = onBar ? BAR : WHITE;
        }
        acc[0] += color[0];
        acc[1] += color[1];
        acc[2] += color[2];
      }
      const i = (y * n + x) * 4;
      pixels[i] = Math.round(acc[0] / 4);
      pixels[i + 1] = Math.round(acc[1] / 4);
      pixels[i + 2] = Math.round(acc[2] / 4);
      pixels[i + 3] = 255;
    }
  }
  return encodePng(n, n, pixels);
}

writeFileSync(join(outDir, 'icon-192.png'), renderIcon(192));
writeFileSync(join(outDir, 'icon-512.png'), renderIcon(512));
console.log('Icons generated:', join(outDir, 'icon-192.png'), join(outDir, 'icon-512.png'));