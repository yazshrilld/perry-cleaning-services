import { HttpStatusCode } from "../../../config";
import { companyModel, usersModel } from "../../../models";

export const seedCompanyName = async (): Promise<any> => {
  try {
    // Step 1: Find all companies where company_name is null, undefined, or empty string
    const companiesToUpdate = await companyModel.companyModel
      .find({
        company_name: { $in: [null, undefined, ""] },
      })
      .select("companyId"); // Only select companyId for efficiency

    console.log(`Found ${companiesToUpdate.length} companies to update.`);

    for (const company of companiesToUpdate) {
      if (!company.companyId) {
        console.log(`Skipping company with ID ${company._id}: No companyId.`);
        continue;
      }

      // Step 2: Find the matching user by companyId and get their name
      const user = await usersModel.UsersModel.findOne({
        publicId: company.companyId,
      }).select("name");

      if (!user || !user.name) {
        console.log(
          `No matching user found for companyId ${company.companyId}, or user has no name.`,
        );
        continue;
      }

      // Step 3: Update the company's company_name
      await companyModel.companyModel.updateOne(
        { _id: company._id },
        { $set: { company_name: user.name } },
      );

      console.log(`Updated company ${company._id} with name: ${user.name}`);
    }

    console.log("Update process completed.");
  } catch (err) {
    console.error("Error seeding company details:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error seeding company details",
      payload: null,
    };
  }
};
