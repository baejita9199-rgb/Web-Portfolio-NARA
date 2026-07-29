#!/usr/bin/env node
/**
 * Generates every placeholder still and ambient clip in /public/nara-house.
 *
 * The output is deterministic: running this twice produces byte-identical
 * files. Replacing a placeholder with real photography is therefore a matter of
 * dropping a file of the same name and aspect ratio over the top — nothing in
 * the application references this script at runtime.
 *
 * Usage:  npm run generate:media [-- --images-only | --videos-only]
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createGrainTile, renderRecipe } from "./lib/compositor.mjs";
import { imageRecipes, videoRecipes } from "./lib/recipes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const IMAGE_DIR = join(ROOT, "public", "nara-house", "images");
const VIDEO_DIR = join(ROOT, "public", "nara-house", "video");

/**
 * Playwright ships a static ffmpeg build. It is deliberately minimal — VP8 in
 * WebM, fed MJPEG over a pipe — which is exactly what is needed here and avoids
 * requiring a system ffmpeg just to regenerate placeholders.
 */
const FFMPEG_CANDIDATES = [
  process.env.FFMPEG_PATH,
  "/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux",
  "/usr/bin/ffmpeg",
  "/usr/local/bin/ffmpeg",
].filter(Boolean);

/** Gradients are evaluated at this fraction of the output and then upscaled. */
const RENDER_SCALE = 0.25;
const MIN_RENDER_WIDTH = 220;

const GRAIN_TILE_SIZE = 256;
const GRAIN_TILE_COUNT = 6;

const grainTiles = Array.from({ length: GRAIN_TILE_COUNT }, (_, index) =>
  sharp(createGrainTile(GRAIN_TILE_SIZE, 20, index + 1), {
    raw: { width: GRAIN_TILE_SIZE, height: GRAIN_TILE_SIZE, channels: 4 },
  })
    .png()
    .toBuffer(),
);

function ensureDirectories() {
  for (const dir of [IMAGE_DIR, VIDEO_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

function renderDimensions(width, height) {
  const renderWidth = Math.max(
    Math.round(width * RENDER_SCALE),
    MIN_RENDER_WIDTH,
  );
  const renderHeight = Math.max(
    Math.round(renderWidth * (height / width)),
    Math.round(MIN_RENDER_WIDTH * (height / width)),
  );
  return [renderWidth, renderHeight];
}

/**
 * Renders one frame to a full-size sharp pipeline: low-resolution gradient,
 * upscaled with a smooth kernel, then film grain composited at native
 * resolution so it stays crisp rather than being magnified into blotches.
 */
async function composeFrame(width, height, recipe, phase, grainIndex) {
  const [renderWidth, renderHeight] = renderDimensions(width, height);
  const raw = renderRecipe(renderWidth, renderHeight, recipe, phase);

  // Stays in raw pixels between the two stages — no intermediate encode/decode
  // just to hand the buffer to the compositing pass.
  const { data, info } = await sharp(raw, {
    raw: { width: renderWidth, height: renderHeight, channels: 3 },
  })
    .resize(width, height, { kernel: "cubic" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const grain = await grainTiles[grainIndex % grainTiles.length];

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  }).composite([{ input: grain, tile: true, blend: "overlay" }]);
}

async function generateImages() {
  const entries = Object.entries(imageRecipes);
  console.log(`Rendering ${entries.length} stills…`);

  for (const [name, { size, recipe }] of entries) {
    const [width, height] = size;
    const pipeline = await composeFrame(width, height, recipe, 0, 0);
    const target = join(IMAGE_DIR, `${name}.webp`);
    await pipeline.webp({ quality: 82, effort: 5 }).toFile(target);
    console.log(`  ${name}.webp  ${width}×${height}`);
  }
}

function resolveFfmpeg() {
  for (const candidate of FFMPEG_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Streams MJPEG frames into ffmpeg. Frames are produced one at a time and
 * written respecting backpressure, so memory stays flat regardless of clip
 * length.
 */
function encodeWebm(ffmpegPath, { fps, bitrate, output }) {
  const args = [
    "-y",
    "-f", "image2pipe",
    "-vcodec", "mjpeg",
    "-framerate", String(fps),
    // `pipe:0` rather than `-`: the bundled build registers the pipe protocol
    // explicitly and does not resolve the shorthand.
    "-i", "pipe:0",
    "-c:v", "libvpx",
    "-b:v", bitrate,
    "-crf", "32",
    "-qmin", "12",
    "-qmax", "42",
    "-deadline", "good",
    "-cpu-used", "2",
    // Alt-ref frames can produce a visible hitch at the loop point.
    "-auto-alt-ref", "0",
    "-pix_fmt", "yuv420p",
    "-an",
    output,
  ];

  const child = spawn(ffmpegPath, args, {
    stdio: ["pipe", "ignore", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const done = new Promise((resolvePromise, rejectPromise) => {
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`ffmpeg exited ${code}\n${stderr.slice(-1200)}`));
    });
  });

  return { child, done };
}

function write(stream, buffer) {
  return new Promise((resolvePromise, rejectPromise) => {
    stream.write(buffer, (error) => (error ? rejectPromise(error) : resolvePromise()));
  });
}

async function generateVideos() {
  const ffmpegPath = resolveFfmpeg();
  if (!ffmpegPath) {
    console.warn(
      "\n! No ffmpeg binary found — skipping clips.\n" +
        "  Set FFMPEG_PATH, or install ffmpeg, then re-run.\n" +
        "  The site still renders: every AmbientVideo falls back to its poster.\n",
    );
    return;
  }

  const entries = Object.entries(videoRecipes);
  console.log(`\nEncoding ${entries.length} clips with ${ffmpegPath}…`);

  for (const [name, { size, seconds, fps, bitrate, recipe }] of entries) {
    const [width, height] = size;
    const frameCount = Math.round(seconds * fps);
    const output = join(VIDEO_DIR, `${name}.webm`);

    const { child, done } = encodeWebm(ffmpegPath, { fps, bitrate, output });

    for (let frame = 0; frame < frameCount; frame += 1) {
      // The final frame is omitted: at phase 1 the recipe returns exactly what
      // phase 0 returns, so including it would double a frame at the loop seam.
      const phase = frame / frameCount;
      const pipeline = await composeFrame(width, height, recipe, phase, frame);
      const jpeg = await pipeline.jpeg({ quality: 92 }).toBuffer();
      await write(child.stdin, jpeg);
    }

    child.stdin.end();
    await done;

    const { size: bytes } = await stat(output);
    console.log(
      `  ${name}.webm  ${width}×${height}  ${seconds}s  ${(bytes / 1024).toFixed(0)} KB`,
    );
  }
}

async function report() {
  const summarise = async (dir, label) => {
    if (!existsSync(dir)) return;
    const files = await readdir(dir);
    let total = 0;
    for (const file of files) {
      const { size } = await stat(join(dir, file));
      total += size;
    }
    console.log(
      `  ${label}: ${files.length} files, ${(total / 1024 / 1024).toFixed(2)} MB`,
    );
  };

  console.log("\nGenerated:");
  await summarise(IMAGE_DIR, "images");
  await summarise(VIDEO_DIR, "video");
}

async function main() {
  const args = process.argv.slice(2);
  const imagesOnly = args.includes("--images-only");
  const videosOnly = args.includes("--videos-only");

  ensureDirectories();

  if (!videosOnly) await generateImages();
  if (!imagesOnly) await generateVideos();
  await report();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
