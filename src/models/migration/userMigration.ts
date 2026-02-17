import { UsersModel } from "../users";

async function migrateIsPasswordChanged() {
  try {
    const result = await UsersModel.updateMany(
      {
        isPasswordChanged: { $exists: false }, // Only update docs where field doesn't exist
      },
      {
        $set: { isPasswordChanged: false },
      },
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

export { migrateIsPasswordChanged};
