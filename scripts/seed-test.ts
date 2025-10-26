async function waitForServer(url: string, maxRetries = 30) {
  console.log(`⏳ Waiting for server at ${url}...`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        console.log(`✅ Server is ready!`);
        return;
      }
    } catch (error) {
      // Server not ready yet
    }

    console.log(`   Retry ${i + 1}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  }

  throw new Error("Server did not become ready in time");
}

async function seedTestData() {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  console.log("🌱 Seeding test data...");
  console.log(`   Using URL: ${baseURL}`);

  // Wait for server to be ready
  await waitForServer(baseURL);

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
      console.log("   Email: test@example.com");
      console.log("   Password: TestPassword123!");
    } else if (response.status === 400 || response.status === 422) {
      console.log("✅ Test user already exists");
      console.log("   Email: test@example.com");
      console.log("   Password: TestPassword123!");
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
