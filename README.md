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
