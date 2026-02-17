import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UsersModel } from "../src/models/users";

const nodeEnv = process.env.NODE_ENV || "staging";
const envFile = `.env.${nodeEnv}`;

dotenv.config({ path: envFile });

const envPrefix = nodeEnv === "staging" ? "STAGING_" : "PRODUCTION_";

const databaseUrl = process.env[`${envPrefix}DATABASE_URL`];
const seedPassword = process.env.SEED_ADMIN_PASSWORD;
const saltRounds = Number(
  process.env[`${envPrefix}PASSWORD_ENCRYPTION_SALT`] || "10",
);

if (!databaseUrl) {
  throw new Error(
    `Missing ${envPrefix}DATABASE_URL in ${envFile} or environment`,
  );
}

if (!seedPassword) {
  throw new Error("Missing SEED_ADMIN_PASSWORD in environment");
}

const seed = async () => {
  await mongoose.connect(databaseUrl);

  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const username = process.env.SEED_ADMIN_USERNAME || "superadmin";
  const firstName = process.env.SEED_ADMIN_FIRST_NAME || "Super";
  const lastName = process.env.SEED_ADMIN_LAST_NAME || "Admin";
  const phone = process.env.SEED_ADMIN_PHONE || "0000000000";

  const existing = await UsersModel.findOne({ email }).lean();
  if (existing) {
    console.log("SUPER_ADMIN already exists, skipping seed");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(seedPassword, saltRounds);

  await UsersModel.create({
    username,
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: "super_admin",
    roles: ["super_admin"],
    isActive: true,
  });

  console.log("Seeded SUPER_ADMIN user: admin@example.com");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
