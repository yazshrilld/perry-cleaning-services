// import { userMigrate } from "./migration";
import { UsersModel } from "./users"; 




export const setupAssociations = async() => {
  UsersModel.schema.virtual("tokens", {
    ref: "VerificationToken", // The model to populate
    localField: "_id", // User's _id field
    foreignField: "userId", // Field in Token that stores user reference
    justOne: false, // Return array of tokens
  });

  UsersModel.schema.virtual("company", {
    ref: "company", // The Mongoose model name of the related schema
    localField: "companyId", // Field in the companySchema
    foreignField: "companyId", // Field in the UserSchema that references Wallet
    justOne: true,
  });
 
  // Enable virtuals in output
  UsersModel.schema.set("toObject", { virtuals: true });
  UsersModel.schema.set("toJSON", { virtuals: true });



  //userMigrate.migrateIsPasswordChanged();
};
