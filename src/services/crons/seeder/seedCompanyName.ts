import { HttpStatusCode } from "../../../config";
import { usersModel } from "../../../models";

export const seedCompanyName = async (): Promise<any> => {
  try {
    void usersModel;
    console.log(
      "seedCompanyName is disabled: no company model is configured in this codebase.",
    );
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "seedCompanyName is disabled",
      payload: null,
    };
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
