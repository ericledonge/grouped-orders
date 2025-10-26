async function seedTestData() {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  console.log("🌱 Seeding test data...");

  try {
    const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "TestPassword123!",
        name: "Test User",
      }),
    });

    if (response.ok) {
      console.log("✅ Test user created successfully!");
      console.log("   Email: test@example.com");
      console.log("   Password: TestPassword123!");
    } else if (response.status === 400 || response.status === 422) {
      console.log("✅ Test user already exists: test@example.com");
    } else {
      const data = await response.json();
      console.error("❌ Unexpected error:", response.status);
      console.error("Response:", JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
}

seedTestData();
