/**
 * Usage:
 *   node scripts/make-admin.mjs zohaib.ali31@gmail.com
 *
 * Makes the given email an admin (and patches all users missing isAdmin/phone).
 */

import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = "mongodb://127.0.0.1:27017/pizzavalley";
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error("❌  Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  const db = client.db();
  const users = db.collection("users");

  // 1 — Patch ALL existing users that are missing isAdmin or phone
  const patchResult = await users.updateMany(
    { $or: [{ isAdmin: { $exists: false } }, { phone: { $exists: false } }] },
    { $set: { isAdmin: false, phone: "" } }
  );
  console.log(`✅  Patched ${patchResult.modifiedCount} user(s) with missing fields.`);

  // 2 — Promote the target email to admin
  const adminResult = await users.updateOne(
    { email: targetEmail.toLowerCase() },
    { $set: { isAdmin: true } }
  );

  if (adminResult.matchedCount === 0) {
    console.error(`❌  No user found with email: ${targetEmail}`);
  } else {
    console.log(`🛡️   ${targetEmail} is now an admin.`);
  }

  // 3 — Print current user list
  const all = await users.find({}, { projection: { email: 1, isAdmin: 1 } }).toArray();
  console.log("\nCurrent users:");
  all.forEach(u => console.log(`  ${u.isAdmin ? "🛡️ " : "👤"} ${u.email}`));

} finally {
  await client.close();
}
