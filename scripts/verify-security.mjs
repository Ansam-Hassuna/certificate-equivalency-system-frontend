import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "build"].includes(entry.name)) return walk(full);
    return entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const files = walk("src");
const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const forbidden = [
  ["hard-coded demo credential", /equivalency\.local|Admin@123|Role@123/i],
  ["browser password hashing", /crypto\.subtle\.digest|subtle\.digest/i],
  ["local user database", /ce_verified_users|localStorage\.setItem\([^\n]*user/i],
  ["client payment persistence", /certificate-equivalency-payment-state|confirmPayment\(\)\s*\{[^}]*localStorage/is],
  ["dangerous HTML injection", /dangerouslySetInnerHTML|\.innerHTML\s*=/],
  ["dynamic code execution", /\beval\s*\(|new\s+Function\s*\(/],
];
const failed = forbidden.filter(([, regex]) => regex.test(source));
if (failed.length) {
  console.error("Frontend security verification failed:", failed.map(([name]) => name));
  process.exit(1);
}
console.log(`Frontend security verification passed across ${files.length} source files.`);
