const TASOLLER_OPTIONS_REPORT_LEN = 65;

const STARTUP_KEY = Uint8Array.from([
  0x07, 0x08, 0x0c, 0x43, 0x36, 0x57, 0x59, 0x36,
  0x20, 0x0c, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

const AES_SBOX = Uint8Array.from([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
  0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
  0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
  0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
  0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
  0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
  0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
  0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
  0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
  0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
  0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
  0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
  0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
  0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
  0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
  0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
  0xb0, 0x54, 0xbb, 0x16,
]);

const AES_RCON = Uint8Array.from([
  0x01, 0x02, 0x04, 0x08, 0x10,
  0x20, 0x40, 0x80, 0x1b, 0x36,
]);

function xtime(value) {
  return ((value << 1) & 0xff) ^ ((value & 0x80) ? 0x1b : 0x00);
}

function addRoundKey(state, roundKey) {
  for (let i = 0; i < 16; i++) {
    state[i] ^= roundKey[i];
  }
}

function subBytes(state) {
  for (let i = 0; i < 16; i++) {
    state[i] = AES_SBOX[state[i]];
  }
}

function shiftRows(state) {
  for (let row = 0; row < 4; row++) {
    const base = row * 4;
    const r0 = state[base + 0];
    const r1 = state[base + 1];
    const r2 = state[base + 2];
    const r3 = state[base + 3];
    state[base + 0] = [r0, r1, r2, r3][(row + 0) & 3];
    state[base + 1] = [r0, r1, r2, r3][(row + 1) & 3];
    state[base + 2] = [r0, r1, r2, r3][(row + 2) & 3];
    state[base + 3] = [r0, r1, r2, r3][(row + 3) & 3];
  }
}

function mixColumns(state) {
  for (let c = 0; c < 4; c++) {
    const a0 = state[c];
    const a1 = state[4 + c];
    const a2 = state[8 + c];
    const a3 = state[12 + c];

    state[c] = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
    state[4 + c] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
    state[8 + c] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
    state[12 + c] = (xtime(a0) ^ a0) ^ a1 ^ a2 ^ xtime(a3);
  }
}

function transposeBlock(input) {
  const output = new Uint8Array(16);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      output[r * 4 + c] = input[c * 4 + r];
    }
  }
  return output;
}

function expandRoundKeys(keyBytes) {
  const words = Array.from({ length: 44 }, () => new Uint8Array(4));
  for (let i = 0; i < 4; i++) {
    words[i].set(keyBytes.slice(i * 4, i * 4 + 4));
  }

  for (let i = 4; i < 44; i++) {
    const temp = Uint8Array.from(words[i - 1]);
    if ((i % 4) === 0) {
      const first = temp[0];
      temp[0] = AES_SBOX[temp[1]] ^ AES_RCON[(i / 4) - 1];
      temp[1] = AES_SBOX[temp[2]];
      temp[2] = AES_SBOX[temp[3]];
      temp[3] = AES_SBOX[first];
    }

    for (let j = 0; j < 4; j++) {
      words[i][j] = words[i - 4][j] ^ temp[j];
    }
  }

  return Array.from({ length: 11 }, (_, round) => {
    const rawRound = new Uint8Array(16);
    for (let col = 0; col < 4; col++) {
      rawRound.set(words[round * 4 + col], col * 4);
    }
    return transposeBlock(rawRound);
  });
}

function encryptMi01BlockWithRoundKeys(input, roundKeys) {
  let state = transposeBlock(input);
  addRoundKey(state, roundKeys[0]);

  for (let round = 1; round < 10; round++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, roundKeys[round]);
  }

  subBytes(state);
  shiftRows(state);
  addRoundKey(state, roundKeys[10]);
  return transposeBlock(state);
}

export function buildEncryptedMi01Report(payloadBytes, roundKeys) {
  if (!(payloadBytes instanceof Uint8Array) || !Array.isArray(roundKeys)) {
    throw new Error("Invalid MI_01 encrypt input");
  }
  if (payloadBytes.length === 0 || payloadBytes.length > 62) {
    throw new Error("MI_01 payload length must be between 1 and 62");
  }

  const work = new Uint8Array(64);
  work[0] = payloadBytes.length;
  work.set(payloadBytes, 1);

  let checksum = 0;
  for (const value of payloadBytes) {
    checksum = (checksum + value) & 0xff;
  }
  work[63] = checksum;

  const report = new Uint8Array(TASOLLER_OPTIONS_REPORT_LEN);
  report[0] = 0x00;
  for (let block = 0; block < 4; block++) {
    const encrypted = encryptMi01BlockWithRoundKeys(
      work.slice(block * 16, block * 16 + 16),
      roundKeys
    );
    report.set(encrypted, 1 + block * 16);
  }
  return report;
}

export function buildEncryptedMi01ReportWithKey(payloadBytes, keyBytes) {
  return buildEncryptedMi01Report(payloadBytes, expandRoundKeys(keyBytes));
}

export function buildSeedReport(seed17) {
  if (!(seed17 instanceof Uint8Array) || seed17.length !== 17) {
    throw new Error("seed17 must be a 17-byte Uint8Array");
  }

  const report = new Uint8Array(TASOLLER_OPTIONS_REPORT_LEN);
  report[0] = 0x00;
  report[1] = 0x12;
  report[2] = 0x01;
  report.set(seed17, 3);

  let checksum = 0;
  for (let i = 0; i < 18; i++) {
    checksum = (checksum + report[2 + i]) & 0xff;
  }
  report[64] = checksum;
  return report;
}

export function rotateSeedLeft(seed17) {
  if (!(seed17 instanceof Uint8Array) || seed17.length !== 17) {
    throw new Error("seed17 must be a 17-byte Uint8Array");
  }

  const rotated = new Uint8Array(17);
  rotated.set(seed17.slice(1), 0);
  rotated[16] = seed17[0];
  return rotated;
}

export function encryptStartupBlock(input16) {
  if (!(input16 instanceof Uint8Array) || input16.length !== 16) {
    throw new Error("input16 must be a 16-byte Uint8Array");
  }
  const startupRoundKeys = expandRoundKeys(STARTUP_KEY);
  return encryptMi01BlockWithRoundKeys(input16, startupRoundKeys);
}

export function createSessionFromSeed(seed17) {
  const seedRotated = rotateSeedLeft(seed17);
  const tempKey = encryptStartupBlock(seed17.slice(1, 17));
  const sessionKey = encryptStartupBlock(seedRotated.slice(1, 17));

  return {
    seed: Uint8Array.from(seed17),
    seedRotated,
    tempKey,
    sessionKey,
    tempRoundKeys: expandRoundKeys(tempKey),
    roundKeys: expandRoundKeys(sessionKey),
  };
}

export function generateRandomSeed17() {
  const seed = new Uint8Array(17);
  crypto.getRandomValues(seed);
  return seed;
}

export function buildSessionBootstrapPackets(seed17) {
  const session = createSessionFromSeed(seed17);
  const packets = [];
  const initPayloads = [
    Uint8Array.from([0x2b, 0x00]),
    Uint8Array.from([0x09, 0x00]),
    Uint8Array.from([0x32, 0x00, 0x00]),
    Uint8Array.from([0x34, 0x00]),
    Uint8Array.from([0x2d, 0x00]),
    Uint8Array.from([0x38, 0x00, 0x00]),
    Uint8Array.from([0x37, 0x00, 0x00]),
  ];

  packets.push({ label: "seed-a", report: buildSeedReport(session.seed) });
  packets.push({
    label: "seed-a-ack",
    report: buildEncryptedMi01ReportWithKey(
      Uint8Array.from([0x02, session.seed[0]]),
      session.tempKey
    ),
  });
  packets.push({ label: "seed-b", report: buildSeedReport(session.seedRotated) });
  packets.push({
    label: "seed-b-ack",
    report: buildEncryptedMi01Report(
      Uint8Array.from([0x02, session.seed[1]]),
      session.roundKeys
    ),
  });

  for (const payload of initPayloads) {
    const packet = Uint8Array.from(payload);
    switch (packet[0]) {
      case 0x2b:
        packet[1] = session.seed[2];
        break;
      case 0x09:
        packet[1] = session.seed[3];
        break;
      case 0x32:
        packet[1] = session.seed[4];
        break;
      case 0x34:
        packet[1] = session.seed[5];
        break;
      case 0x2d:
        packet[1] = session.seed[6];
        break;
      case 0x38:
        packet[1] = session.seed[7];
        break;
      case 0x37:
        packet[1] = session.seed[8];
        break;
      default:
        break;
    }

    packets.push({
      label: `init-${packet[0].toString(16).padStart(2, "0")}`,
      report: buildEncryptedMi01Report(packet, session.roundKeys),
    });
  }

  for (let i = 0; i < 8; i++) {
    const payload = Uint8Array.from([0x29, session.seed[9 + i], 0x00, i]);
    packets.push({
      label: `init-29-${i}`,
      report: buildEncryptedMi01Report(payload, session.roundKeys),
    });
  }

  for (let i = 0; i < 5; i++) {
    const payload = Uint8Array.from([0x2a, session.seed[i], 0x00, i]);
    packets.push({
      label: `init-2a-${i}`,
      report: buildEncryptedMi01Report(payload, session.roundKeys),
    });
  }

  for (const payload of [
    Uint8Array.from([0x36, session.seed[5], 0x00]),
    Uint8Array.from([0x08, session.seed[6]]),
    Uint8Array.from([0x25, session.seed[7]]),
    Uint8Array.from([0x26, session.seed[8]]),
    Uint8Array.from([0x27, session.seed[9], 0x00]),
  ]) {
    packets.push({
      label: `init-${payload[0].toString(16).padStart(2, "0")}-tail`,
      report: buildEncryptedMi01Report(payload, session.roundKeys),
    });
  }

  return { session, packets };
}

export function buildModeSwitchPackets(targetModeValue, seed17) {
  if (!Number.isInteger(targetModeValue) || targetModeValue < 0 || targetModeValue > 0xff) {
    throw new Error("targetModeValue must be a byte");
  }

  const { session, packets } = buildSessionBootstrapPackets(seed17);
  return {
    packets: [
      ...packets,
      {
        label: "mode-select",
        report: buildEncryptedMi01Report(
          Uint8Array.from([0x27, 0x50, 0x01, targetModeValue]),
          session.roundKeys
        ),
      },
      {
        label: "mode-apply",
        report: buildEncryptedMi01Report(
          Uint8Array.from([0x2f, 0x50]),
          session.roundKeys
        ),
      },
    ],
    session,
  };
}

export const TasollerOptionsProtocol = {
  STARTUP_KEY,
  expandRoundKeys,
  buildEncryptedMi01Report,
  buildEncryptedMi01ReportWithKey,
  buildSeedReport,
  rotateSeedLeft,
  encryptStartupBlock,
  generateRandomSeed17,
  createSessionFromSeed,
  buildSessionBootstrapPackets,
  buildModeSwitchPackets,
};
