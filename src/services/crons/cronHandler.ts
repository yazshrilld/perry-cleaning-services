import { schedule } from "node-cron";
import { fetchAndStoreFeeds } from "./seeder";

const { DateTimeFormat: dateTimeFormat } = Intl;
const timezone = dateTimeFormat().resolvedOptions().timeZone;

// Define cron expressions
const midnightExpression = "0 0 * * *"; // 00:00 (midnight)
// const sevenAMExpression = "0 7 * * *"; // 07:00 AM
// const tenAMExpression = "0 10 * * *"; // 10:00 AM
const noonExpression = "0 12 * * *"; // 12:00 PM (noon)
// const threePMExpression = "0 15 * * *"; // 15:00 (3 PM)
const sixPMExpression = "0 18 * * *"; // 18:00 (6 PM)

// Track running tasks by label
const taskLocks: Record<string, boolean> = {};

// Wrapper to safely run any async task by label
const runTaskSafely = async (label: string, task: () => Promise<void>) => {
  if (taskLocks[label]) {
    console.warn(`⚠️ Skipping ${label} task — already running.`);
    return;
  }

  taskLocks[label] = true;
  try {
    console.log(`⏱️ Running ${label} task...`);
    await task();
    console.log(`✅ Completed ${label} task.`);
  } catch (err) {
    console.error(`❌ Error in ${label} task:`, err);
  } finally {
    taskLocks[label] = false;
  }
};

// Helper to register cron jobs
const scheduleTask = (
  expression: string,
  label: string,
  task: () => Promise<void>,
) => {
  schedule(expression, () => runTaskSafely(label, task), { timezone });
};

export const cronHandler = async () => {
  try {
    console.log("🚀 Starting cronHandler...");
    console.log(`🌐 Timezone detected: ${timezone}`);
    /////seedCompanyName();
    //await mainSeeder();
    ///  await fetchAndStoreFeeds();
    // Set up each task with a different job
    scheduleTask(midnightExpression, "Midnight", async () => {
      await fetchAndStoreFeeds();
    });

    // scheduleTask(sevenAMExpression, "7 AM", async () => {
    //  await fetchAndStoreRates();
    // });

    // scheduleTask(tenAMExpression, "10 AM", async () => {
    //   await fetchAndStoreRates();
    // });

    scheduleTask(noonExpression, "12 PM (Noon)", async () => {
      await fetchAndStoreFeeds();
    });

    // scheduleTask(threePMExpression, "3 PM", async () => {
    //   await fetchAndStoreRates();
    // });

    scheduleTask(sixPMExpression, "6 PM", async () => {
      await fetchAndStoreFeeds();
    });

    console.log("🕒 All cron jobs scheduled.");
  } catch (error) {
    console.error("❌ Error setting up cronHandler:", error);
  }
};
