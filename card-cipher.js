const VALID_CHARS = "0123456789ABCDEFGHJKLMNPRSTUWXYZ";
const DES_IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
];
const DES_FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
];
const DES_E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];
const DES_P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
];
const DES_PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];
const DES_PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];
const DES_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
const DES_SBOX = [
  [
    14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
    0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
    4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
    15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13,
  ],
  [
    15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
    3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
    0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
    13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9,
  ],
  [
    10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
    13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
    13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
    1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12,
  ],
  [
    7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
    13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
    10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
    3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14,
  ],
  [
    2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
    14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
    4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
    11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3,
  ],
  [
    12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
    10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
    9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
    4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13,
  ],
  [
    4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
    13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
    1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
    6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12,
  ],
  [
    13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
    1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
    7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
    2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11,
  ],
];

function permute(bits, table) {
  return table.map((position) => bits[position - 1]);
}

function rotateLeft(bits, count) {
  return bits.slice(count).concat(bits.slice(0, count));
}

function bytesToBits(bytes) {
  const bits = [];
  for (const byte of bytes) {
    for (let bit = 7; bit >= 0; bit -= 1) {
      bits.push((byte >>> bit) & 1);
    }
  }
  return bits;
}

function bitsToBytes(bits) {
  const bytes = [];
  for (let offset = 0; offset < bits.length; offset += 8) {
    let value = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value << 1) | bits[offset + bit];
    }
    bytes.push(value);
  }
  return bytes;
}

function makeSubkeys(keyBytes) {
  let key = permute(bytesToBits(keyBytes), DES_PC1);
  let left = key.slice(0, 28);
  let right = key.slice(28);
  return DES_SHIFTS.map((shift) => {
    left = rotateLeft(left, shift);
    right = rotateLeft(right, shift);
    return permute(left.concat(right), DES_PC2);
  });
}

function feistel(right, subkey) {
  const expanded = permute(right, DES_E).map((bit, index) => bit ^ subkey[index]);
  const sboxOut = [];
  for (let box = 0; box < 8; box += 1) {
    const chunk = expanded.slice(box * 6, box * 6 + 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const value = DES_SBOX[box][row * 16 + col];
    sboxOut.push((value >>> 3) & 1, (value >>> 2) & 1, (value >>> 1) & 1, value & 1);
  }
  return permute(sboxOut, DES_P);
}

function desBlock(block, key, decrypt = false) {
  const subkeys = makeSubkeys(key);
  if (decrypt) {
    subkeys.reverse();
  }
  let data = permute(bytesToBits(block), DES_IP);
  let left = data.slice(0, 32);
  let right = data.slice(32);
  for (const subkey of subkeys) {
    const nextLeft = right;
    const f = feistel(right, subkey);
    right = left.map((bit, index) => bit ^ f[index]);
    left = nextLeft;
  }
  return bitsToBytes(permute(right.concat(left), DES_FP));
}

function desKey() {
  return Array.from("?I'llB2c.YouXXXeMeHaYpy!", (char) => (char.charCodeAt(0) * 2) & 0xff);
}

function tripleDesEncrypt(block) {
  const key = desKey();
  const k1 = key.slice(0, 8);
  const k2 = key.slice(8, 16);
  const k3 = key.slice(16, 24);
  return desBlock(desBlock(desBlock(block, k1), k2, true), k3);
}

function typeFromCardId(cardId) {
  const upper = cardId.toUpperCase();
  if (upper.startsWith("E0")) return 1;
  if (upper.startsWith("01") || upper.startsWith("02") || upper.startsWith("0BEF")) return 2;
  return 2;
}

function checksum(groups) {
  let sum = 0;
  for (let i = 0; i < 15; i += 3) sum += groups[i];
  for (let i = 1; i < 15; i += 3) sum += groups[i] * 2;
  for (let i = 2; i < 15; i += 3) sum += groups[i] * 3;
  while (sum >= 0x20) {
    sum = Math.floor(sum / 0x20) + (sum % 0x20);
  }
  return sum;
}

function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(Number.parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes;
}

export function encodeEpassCardId(cardId) {
  const normalized = String(cardId).replace(/[\s:-]/g, "").toUpperCase();
  if (!/^[0-9A-F]{16}$/.test(normalized)) {
    return "";
  }

  const reversed = hexToBytes(normalized).reverse();
  const ciphered = tripleDesEncrypt(reversed);
  const bits = bytesToBits(ciphered);
  const groups = new Array(16).fill(0);
  for (let i = 0; i < 13; i += 1) {
    groups[i] = (bits[i * 5] << 4) |
      (bits[i * 5 + 1] << 3) |
      (bits[i * 5 + 2] << 2) |
      (bits[i * 5 + 3] << 1) |
      bits[i * 5 + 4];
  }

  groups[13] = 1;
  groups[0] ^= typeFromCardId(normalized);
  for (let i = 0; i < 14; i += 1) {
    const prevIndex = i - 1 < 0 ? 15 : i - 1;
    groups[i] ^= groups[prevIndex];
  }
  groups[14] = typeFromCardId(normalized);
  groups[15] = checksum(groups);

  return groups.map((value) => VALID_CHARS[value]).join("");
}
