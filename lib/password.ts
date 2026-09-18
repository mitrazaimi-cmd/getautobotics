import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Format: scrypt:N:r:p:salt:hash (base64url). No "$" characters, because Next.js
// expands "$VAR" references when loading .env files.

const KEYLEN = 64;
const DEFAULTS = { N: 32768, r: 8, p: 1 };

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, { ...options, maxmem: 128 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, DEFAULTS);
  return ["scrypt", DEFAULTS.N, DEFAULTS.r, DEFAULTS.p, salt.toString("base64url"), key.toString("base64url")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.trim().split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const N = Number(n);
  const rr = Number(r);
  const pp = Number(p);
  if (![N, rr, pp].every((v) => Number.isInteger(v) && v > 0)) return false;

  const expected = Buffer.from(hashB64!, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64!, "base64url"), expected.length, { N, r: rr, p: pp });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
