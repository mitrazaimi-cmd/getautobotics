// Generates ADMIN_PASSWORD_HASH for .env.
// Usage: npm run hash-password -- "your strong password"
// (or run without an argument to be prompted)
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline/promises";

let password = process.argv[2];
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Admin password (at least 12 characters): ");
  rl.close();
}
if (!password || password.length < 12) {
  console.error("Use a password with at least 12 characters.");
  process.exit(1);
}

const N = 32768, r = 8, p = 1;
const salt = randomBytes(16);
const key = await new Promise((resolve, reject) =>
  scrypt(password, salt, 64, { N, r, p, maxmem: 128 * 1024 * 1024 }, (err, k) => (err ? reject(err) : resolve(k))),
);

console.log("\nAdd this line to your .env (and to Vercel environment variables):\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${key.toString("base64url")}\n`);
