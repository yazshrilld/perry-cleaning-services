import { HttpStatusCode } from "../../../config";
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
    void walletIds;
    void status;
    console.log(
      "toggleWalletStatusSeeder is disabled: wallet models are not configured in this codebase.",
    );
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "toggleWalletStatusSeeder is disabled",
      payload: null,
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
