import { HttpStatusCode } from "../../../config";
import { SeederResponse } from "./types";



export const seedCompanyWallets = async (): Promise<SeederResponse> => {
  try {
    console.log(
      "seedCompanyWallets is disabled: no company model is configured in this codebase.",
    );
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "seedCompanyWallets is disabled",
      payload: null,
    };
  } catch (err) {
    console.error("Error seeding company wallets:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error seeding company wallets",
      payload: null,
    };
  }
};
