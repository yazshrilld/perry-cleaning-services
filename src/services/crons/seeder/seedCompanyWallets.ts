import { HttpStatusCode } from "../../../config";
import { companyModel, UserWalletModel, WalletModel } from "../../../models";
import { SeederResponse } from "./types";



export const seedCompanyWallets = async (): Promise<SeederResponse> => {
  try {
    // Fetch all companies
    const companies = await companyModel.companyModel.find().lean();
    if (!companies || companies.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No companies found to seed wallets",
        payload: null,
      };
    }

    // Fetch all wallet types
    const walletTypes = await WalletModel.WalletModel.find({
      status: "active",
    }).lean();
    if (!walletTypes || walletTypes.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No active wallet types found to seed wallets",
        payload: null,
      };
    }

    let createdWallets = 0;
    let skippedWallets = 0;
    const errors: string[] = [];

    // Loop through each company
    for (const company of companies) {
      if (!company.companyId) {
        errors.push(
          `Company ${company.companyId} has no companyId, skipping wallet creation`,
        );
        continue;
      }

      // Loop through each wallet type
      for (const walletType of walletTypes) {
        // Check if a wallet already exists for this company and wallet type
        const existingWallet = await UserWalletModel.UserWalletModel.findOne({
          userId: company.companyId,
          walletId: walletType._id,
        }).lean();

        if (existingWallet) {
          skippedWallets++;
          continue;
        }

        // Create a new wallet for the company and wallet type
        try {
          const rec = await UserWalletModel.UserWalletModel.findOneAndUpdate(
            {
              userId: company.companyId,
              walletId: walletType._id,
            },
            {
              $set: {
                status: walletType.status,
                available_balance: 0,
                book_balance: 0,
                sign: walletType.currency,
              },
            },
            {
              upsert: true,
              new: true,
            },
          );
          if (!rec.sign) {
            console.warn(
              `Warning: Wallet created/updated for company ${company.companyId} with wallet type ${walletType._id} has no sign field`,
            );
          }
          createdWallets++;
          console.log({ rec, createdWallets });
          // const rec = await UserWalletModel.UserWalletModel.create({
          //   userId: company.companyId,
          //   walletId: walletType._id,
          //   status: "active",
          //   available_balance: 0,
          //   book_balance: 0,
          //   sign: walletType.sign,
          // });
          // createdWallets++;
          // console.log({ rec, createdWallets });
        } catch (err) {
          errors.push(
            `Failed to create/update wallet for company ${company.companyId} with wallet type ${walletType._id}: ${(err as Error).message}`,
          );
        }
      }
    }

    return {
      status: createdWallets > 0,
      statusCode:
        createdWallets > 0 ? HttpStatusCode.OK : HttpStatusCode.BadRequest,
      message:
        createdWallets > 0
          ? "Company wallet seeding completed"
          : "No wallets were created due to errors or existing wallets",
      payload: {
        createdWallets,
        skippedWallets,
        errors,
      },
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
