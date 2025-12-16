async function seedTestData() {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const databaseUrl = process.env.DATABASE_URL;

  console.log("🌱 Seeding test data...");
  console.log(`   Using URL: ${baseURL}`);

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(databaseUrl);

    // Check if database already has users
    const existingUsers =
      await sql`SELECT COUNT(*) as count FROM "user" LIMIT 1`;
    const userCount = Number(existingUsers[0]?.count || 0);

    console.log(`📊 Current user count in database: ${userCount}`);

    // If database is empty, create a dummy first user to claim the "admin" role
    // This ensures subsequent test users get the default "user" role
    if (userCount === 0) {
      console.log(
        "🎯 Database is empty, creating dummy first user to claim admin role...",
      );

      const dummyResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "first-user-dummy@example.com",
          password: "DummyPassword123!",
          name: "First User (Dummy)",
        }),
      });

      if (dummyResponse.ok) {
        console.log(
          "✅ Dummy first user created (will automatically get admin role)",
        );
      } else {
        const errorData = await dummyResponse.json();
        console.error("❌ Failed to create dummy first user");
        console.error("Response:", JSON.stringify(errorData, null, 2));
        process.exit(1);
      }
    } else {
      console.log("ℹ️  Database already has users, skipping dummy user creation");
    }

    console.log("✅ Seed completed! Tests can now create users with default 'user' role");
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
}

seedTestData();
