import { HttpStatusCode } from "../../../config";
import { UserWalletModel, WalletModel } from "../../../models";
import { ObjectId } from "mongodb";
import { SeederResponse, ToggleWalletStatusInput } from "./types";



/**
 * Seeder function to activate or deactivate wallets and their related user wallets
 * @param input - Object containing walletIds and desired status
 * @returns SeederResponse with the result of the operation
 */
export const toggleWalletStatusSeeder = async (
  input: ToggleWalletStatusInput,
): Promise<SeederResponse> => {
  const { walletIds, status } = input;
  try {
    // Validate input
    if (!walletIds || walletIds.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.BadRequest,
        message: "No wallet IDs provided",
        payload: null,
      };
    }

    let updatedWallets = 0;
    let updatedUserWallets = 0;
    const errors: string[] = [];

    // Loop through each walletId
    for (const walletId of walletIds) {
      try {
        // Validate ObjectId
        if (!ObjectId.isValid(walletId)) {
          errors.push(`Invalid wallet ID: ${walletId}`);
          continue;
        }

        // Update the wallet status in the Wallet table
        const walletUpdateResult =
          await WalletModel.WalletModel.findOneAndUpdate(
            { _id: new ObjectId(walletId) },
            { $set: { status } },
            { new: true },
          ).lean();

        if (!walletUpdateResult) {
          errors.push(`Wallet with ID ${walletId} not found`);
          continue;
        }

        updatedWallets++;

        // Update all related UserWallet entries
        const userWalletUpdateResult =
          await UserWalletModel.UserWalletModel.updateMany(
            { walletId: new ObjectId(walletId) },
            { $set: { status } },
          );

        updatedUserWallets += userWalletUpdateResult.modifiedCount;
      } catch (err) {
        errors.push(
          `Failed to update wallet ${walletId} or its user wallets: ${(err as Error).message}`,
        );
      }
    }

    if (updatedWallets === 0 && errors.length > 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No wallets were updated due to errors",
        payload: {
          updatedWallets,
          updatedUserWallets,
          errors,
        },
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: `Wallet status seeding completed. Set status to ${status}`,
      payload: {
        updatedWallets,
        updatedUserWallets,
        errors,
      },
    };
  } catch (err) {
    console.error("Error in toggleWalletStatusSeeder:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error toggling wallet status",
      payload: null,
    };
  }
};
