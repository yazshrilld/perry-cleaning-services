// src/seeders/mainSeeder.ts
import { seedCompanyWallets } from "./seedCompanyWallets";
// import { fetchAndStoreRates } from "./fetchAndStoreRates";
// import { fetchAndStoreFeeds } from "./fetchAndStoreFeeds";
// import { toggleWalletStatusSeeder } from "./toggleWalletStatusSeeder"; // if needed

export async function mainSeeder() {
  try {
    console.log("🚀 Starting main seeder...");

    // Example: Uncomment the ones you want to run
    // const result = await toggleWalletStatusSeeder({
    //   walletIds: ["680622dd09eb0ec667e906a3", "6806232b09eb0ec667e906ab"],
    //   status: "inactive",
    // });
    // console.log("Wallet status updated:", result);

    const resultCompany = await seedCompanyWallets();
    console.log("✅ Company wallets seeded",resultCompany);

    // await fetchAndStoreRates();
    // console.log("✅ Rates fetched and stored");

    // await fetchAndStoreFeeds();
    // console.log("✅ Feeds fetched and stored");

    // console.log("🎉 Main seeder completed successfully");
  } catch (error) {
    console.error("❌ Main seeder failed:", error);
    process.exit(1); // Exit with error
  }
}

// Only run automatically if this file is executed directly (node mainSeeder.js)
if (require.main === module) {
  mainSeeder().then(() => process.exit(0));
}
