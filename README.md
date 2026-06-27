# Chuni Controller Test

Static browser-based controller and reader test page for CHUNITHM-related hardware.

## Reader test coverage

- Aime / SEGA reader over Web Serial COM mode.
- Hinata HID mode firmware probe.
- Hinata WebUSB endpoint probe matching the Android toolbox flow: Hinata firmware report, direct PN532, then SEGA reader frame.
- Hinata HID attempt for SEGA reader-compatible frames.
- Direct PN532 firmware fallback for COM and WebUSB reader probes.
- SEGA reader startup sequence: reset, firmware, hardware, LED board probe, radio on, key setup.
- Card poll path: poll, select, authenticate, read MIFARE blocks 1 and 2, and display Aime access code when available.

Use HTTPS or localhost so the browser can expose Web Serial, WebHID, and WebUSB-capable APIs.

## Pre-baked LED video

The `Bad Apple Demo` button first looks for pre-rendered LED frames at:

```text
assets/bad-apple-led.json
```

Generate that file from a local video with ffmpeg installed:

```powershell
node tools/bake-led-video.mjs `
  --input .\assets\bad-apple-source.mp4 `
  --output .\assets\bad-apple-led.json `
  --fps 30 `
  --crop 16:9 `
  --sample-row 50 `
  --threshold 128 `
  --brightness 1.2 `
  --contrast 1.1
```

Useful tuning flags:

- `--crop 4:3` or `--crop 16:9` controls source aspect before sampling.
- `--sample-row 0..100` chooses the vertical row sampled after crop.
- `--threshold 0..255` makes black/white silhouette frames.
- Omit `--threshold` and use `--grayscale` or full color for non-silhouette output.
- `--invert` flips black/white output.

If `assets/bad-apple-led.json` is not present, the page falls back to `assets/bad-apple.webm`; if that is also missing, it uses a generated LED-only demo.
