import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { user } from "../src/lib/db/schema";

/**
 * Script pour promouvoir un utilisateur en admin
 *
 * Usage: tsx scripts/promote-admin.ts <email>
 */
async function promoteToAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Usage: tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  console.log(`🔍 Looking for user with email: ${email}`);

  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!foundUser) {
    console.error(`❌ User with email ${email} not found`);
    process.exit(1);
  }

  if (foundUser.role === "admin") {
    console.log(`✅ User ${email} is already an admin`);
    process.exit(0);
  }

  console.log(`📝 Promoting ${email} to admin...`);

  await db.update(user).set({ role: "admin" }).where(eq(user.id, foundUser.id));

  console.log(`✅ User ${email} promoted to admin successfully!`);
}

promoteToAdmin().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
