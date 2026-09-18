// Derives the square AB mark from the full logo for favicons, the Apple touch icon,
// and email headers. Source files are only read, never modified.
// Run: npm run icons
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCE = "logo-full.png"; // 2560×1701, opaque white background
// Bounding region of the AB monogram + orbit swoosh (excludes the wordmark)
const MARK_REGION = { left: 600, top: 300, width: 1370, height: 730 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function markBuffer() {
  // Two pipelines: sharp runs trim before extract when chained in one.
  const region = await sharp(SOURCE).extract(MARK_REGION).toBuffer();
  return sharp(region).trim({ background: "#ffffff", threshold: 12 }).toBuffer();
}

async function squareIcon(mark, size, paddingRatio, out) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const resized = await sharp(mark)
    .resize(inner, inner, { fit: "contain", background: WHITE })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✔ ${out} (${size}×${size})`);
}

await mkdir("public/brand", { recursive: true });
const mark = await markBuffer();

await squareIcon(mark, 512, 0.1, "app/icon.png");
await squareIcon(mark, 180, 0.1, "app/apple-icon.png");
await squareIcon(mark, 96, 0.06, "public/brand/ab-mark-96.png"); // email header at 48px
await squareIcon(mark, 512, 0.08, "public/brand/ab-mark-512.png"); // structured data / OG
