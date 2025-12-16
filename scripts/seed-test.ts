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
    // Delete existing test user to ensure fresh user with correct default role
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(databaseUrl);

    console.log("🗑️  Deleting existing test user...");
    await sql`DELETE FROM "user" WHERE email = 'test@example.com'`;
    console.log("✅ Existing test user deleted");

    // Create new test user
    const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "TestPassword123!",
        name: "Test User",
      }),
    });

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      console.error("❌ Server returned non-JSON response");
      console.error(`   Status: ${response.status}`);
      console.error(`   Content-Type: ${contentType}`);
      const text = await response.text();
      console.error(`   Body preview: ${text.substring(0, 200)}...`);
      process.exit(1);
    }

    if (response.ok) {
      console.log("✅ Test user created successfully!");

      // Force the role to "user" in case Better Auth assigned "admin" to first user
      await sql`UPDATE "user" SET role = 'user' WHERE email = 'test@example.com'`;
      console.log("✅ Role explicitly set to 'user'");

      console.log("   Email: test@example.com");
      console.log("   Password: TestPassword123!");
    } else {
      const data = await response.json();
      console.error("❌ Failed to create test user:", response.status);
      console.error("Response:", JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
}

seedTestData();
