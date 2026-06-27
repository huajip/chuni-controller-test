#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function usage() {
  console.log(`Usage:
  node tools/bake-led-video.mjs --input video.mp4 --output assets/bad-apple-led.json [options]

Options:
  --fps 30                 Output LED frame rate
  --layout billboard       Output layout: billboard or linear
  --fit cover              For billboard layout: cover crops edges, contain pads
  --sample-row 50          Vertical sample position, percent after crop
  --crop 16:9              Crop aspect ratio before sampling, e.g. 16:9, 4:3, 1:1
  --brightness 1.0         Brightness multiplier
  --contrast 1.0           Contrast multiplier
  --threshold 0..255       Convert to black/white using luma threshold
  --invert                 Invert colors after processing
  --grayscale              Convert RGB to grayscale, but keep 0..255 levels
  --loop false             Set metadata loop flag
  --ffmpeg ffmpeg          ffmpeg executable path
`);
}

function parseArgs(argv) {
  const args = {
    fps: 30,
    leds: 132,
    layout: "billboard",
    fit: "cover",
    sampleRow: 50,
    crop: "16:9",
    brightness: 1,
    contrast: 1,
    threshold: null,
    invert: false,
    grayscale: false,
    loop: true,
    ffmpeg: "ffmpeg",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) {
        throw new Error(`Missing value for ${arg}`);
      }
      return argv[++i];
    };

    switch (arg) {
      case "--input":
        args.input = next();
        break;
      case "--output":
        args.output = next();
        break;
      case "--fps":
        args.fps = Number(next());
        break;
      case "--leds":
        args.leds = Number(next());
        break;
      case "--layout":
        args.layout = next();
        break;
      case "--fit":
        args.fit = next();
        break;
      case "--sample-row":
        args.sampleRow = Number(next());
        break;
      case "--crop":
        args.crop = next();
        break;
      case "--brightness":
        args.brightness = Number(next());
        break;
      case "--contrast":
        args.contrast = Number(next());
        break;
      case "--threshold":
        args.threshold = Number(next());
        break;
      case "--invert":
        args.invert = true;
        break;
      case "--grayscale":
        args.grayscale = true;
        break;
      case "--loop":
        args.loop = next() !== "false";
        break;
      case "--ffmpeg":
        args.ffmpeg = next();
        break;
      case "--help":
      case "-h":
        usage();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.input || !args.output) {
    usage();
    throw new Error("--input and --output are required");
  }

  if (!Number.isFinite(args.fps) || args.fps <= 0) {
    throw new Error("--fps must be positive");
  }

  if (!Number.isInteger(args.leds) || args.leds <= 0) {
    throw new Error("--leds must be a positive integer");
  }

  if (!["billboard", "linear"].includes(args.layout)) {
    throw new Error("--layout must be billboard or linear");
  }

  if (!["cover", "contain"].includes(args.fit)) {
    throw new Error("--fit must be cover or contain");
  }

  if (!Number.isFinite(args.sampleRow) || args.sampleRow < 0 || args.sampleRow > 100) {
    throw new Error("--sample-row must be 0..100");
  }

  return args;
}

function cropFilter(aspect) {
  const match = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect);
  if (!match) {
    throw new Error("--crop must look like 16:9");
  }

  const w = Number(match[1]);
  const h = Number(match[2]);
  const ratio = w / h;
  return ratio;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function processRgb(bytes, args) {
  const out = Buffer.alloc(bytes.length);

  for (let i = 0; i < bytes.length; i += 3) {
    let r = bytes[i];
    let g = bytes[i + 1];
    let b = bytes[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (args.threshold !== null) {
      const value = luma >= args.threshold ? 255 : 0;
      r = value;
      g = value;
      b = value;
    } else if (args.grayscale) {
      r = luma;
      g = luma;
      b = luma;
    }

    r = (r - 128) * args.contrast + 128;
    g = (g - 128) * args.contrast + 128;
    b = (b - 128) * args.contrast + 128;
    r *= args.brightness;
    g *= args.brightness;
    b *= args.brightness;

    if (args.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    out[i] = clampByte(r);
    out[i + 1] = clampByte(g);
    out[i + 2] = clampByte(b);
  }

  return out;
}

function mapBillboardFrames(bytes) {
  const cols = 11;
  const rows = 10;
  const width = cols;
  const sourceFrameSize = cols * rows * 3;
  const frameCount = Math.floor(bytes.length / sourceFrameSize);
  const leftLeds = 66;
  const rightLeds = 66;
  const out = Buffer.alloc(frameCount * (leftLeds + rightLeds) * 3);

  for (let frame = 0; frame < frameCount; frame++) {
    const frameBase = frame * sourceFrameSize;
    const outBase = frame * (leftLeds + rightLeds) * 3;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const sourceBase = frameBase + (row * width + col) * 3;
        const led = col < 5 ? col * 10 + row : leftLeds + (col - 5) * 10 + row;
        const targetBase = outBase + led * 3;
        out[targetBase + 0] = bytes[sourceBase + 0] ?? 0;
        out[targetBase + 1] = bytes[sourceBase + 1] ?? 0;
        out[targetBase + 2] = bytes[sourceBase + 2] ?? 0;
      }
    }
  }

  return out;
}

function siblingToolPath(toolPath, siblingName) {
  return toolPath.replace(/ffmpeg(\.exe)?$/i, `${siblingName}$1`);
}

function runProcess(command, processArgs, stdio = ["ignore", "pipe", "pipe"]) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const errors = [];
    const child = spawn(command, processArgs, { stdio });

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(errors).toString("utf8") || `${command} exited ${code}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
  });
}

async function probeVideoSize(args) {
  const ffprobe = siblingToolPath(args.ffmpeg, "ffprobe");
  const output = await runProcess(ffprobe, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=s=x:p=0",
    args.input,
  ]);
  const [width, height] = output.toString("utf8").trim().split("x").map(Number);

  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error(`Unable to probe video size: ${output.toString("utf8").trim()}`);
  }

  return { width, height };
}

function even(value) {
  return Math.max(2, Math.floor(value / 2) * 2);
}

async function runFfmpeg(args) {
  const { width, height } = await probeVideoSize(args);
  const ratio = cropFilter(args.crop);
  const inputRatio = width / height;
  const cropW = even(inputRatio > ratio ? height * ratio : width);
  const cropH = even(inputRatio > ratio ? height : width / ratio);
  const cropX = Math.max(0, Math.floor((width - cropW) / 2));
  const cropY = Math.max(0, Math.floor((height - cropH) / 2));
  const sampleY = Math.max(0, Math.min(cropH - 1, Math.floor((cropH - 1) * (args.sampleRow / 100))));
  const scale = args.layout === "billboard" ? "11:10" : `${args.leds}:1`;
  const billboardScale = args.fit === "cover"
    ? "scale=11:10:force_original_aspect_ratio=increase,crop=11:10"
    : "scale=11:10:force_original_aspect_ratio=decrease,pad=11:10:(ow-iw)/2:(oh-ih)/2:black";
  const vf = [
    `fps=${args.fps}`,
    `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
    "format=rgb24",
    args.layout === "billboard"
      ? billboardScale
      : `crop=${cropW}:1:0:${sampleY},scale=${scale}:flags=area`,
    "format=rgb24",
  ].join(",");

  return runProcess(args.ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    args.input,
    "-vf",
    vf,
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgb24",
    "-",
  ]);
}

const args = parseArgs(process.argv.slice(2));
const raw = await runFfmpeg(args);
const mapped = args.layout === "billboard" ? mapBillboardFrames(raw) : raw;
const processed = processRgb(mapped, args);
const frameSize = args.layout === "billboard" ? 132 * 3 : args.leds * 3;
const frameCount = Math.floor(processed.length / frameSize);

mkdirSync(dirname(resolve(args.output)), { recursive: true });
writeFileSync(args.output, JSON.stringify({
  version: 1,
  fps: args.fps,
  layout: args.layout,
  leds: args.layout === "billboard" ? 132 : args.leds,
  leftLeds: args.layout === "billboard" ? 66 : 0,
  rightLeds: args.layout === "billboard" ? 66 : 0,
  frameCount,
  loop: args.loop,
  source: {
    crop: args.crop,
    sampleRow: args.sampleRow,
    brightness: args.brightness,
    contrast: args.contrast,
    threshold: args.threshold,
    invert: args.invert,
    grayscale: args.grayscale,
    fit: args.fit,
  },
  frames: processed.subarray(0, frameCount * frameSize).toString("base64"),
}, null, 2));

console.log(`Wrote ${args.output}: ${frameCount} frames @ ${args.fps} fps, ${args.leds} LEDs`);
