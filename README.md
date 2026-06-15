# Chuni Controller Test

Static browser-based controller and reader test page for CHUNITHM-related hardware.

## Reader test coverage

- Aime / SEGA reader over Web Serial COM mode.
- Hinata HID mode firmware probe.
- Hinata HID attempt for SEGA reader-compatible frames.
- SEGA reader startup sequence: reset, firmware, hardware, LED board probe, radio on, key setup.
- Card poll path: poll, select, authenticate, read MIFARE blocks 1 and 2, and display Aime access code when available.

Use HTTPS or localhost so the browser can expose Web Serial, WebHID, and WebUSB-capable APIs.
