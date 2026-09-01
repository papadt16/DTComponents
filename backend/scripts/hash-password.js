// Generates a bcrypt hash to use as ADMIN_PASSWORD_HASH.
// Usage:
//   node scripts/hash-password.js "your-new-strong-password"
import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js "your-new-strong-password"');
  process.exit(1);
}

if (password.length < 12) {
  console.warn(
    "Warning: that password is under 12 characters. Use a long, unique password " +
    "you don't reuse anywhere else — this protects your entire product catalog and orders."
  );
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nAdd this to your backend's environment variables (e.g. Render dashboard):\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
