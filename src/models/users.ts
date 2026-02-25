import { Schema, model } from "mongoose";
import { usersSchemaType } from "./types";

const UsersSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: String,
    },
    name: {
      type: String,
    },
    picture: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    role: {
      type: String,
      default: "admin",
    },
    roles: {
      type: [String],
      default: ["admin"],
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

export const UsersModel = model<usersSchemaType>("Users", UsersSchema);

// Users
const anyUser = [{
  username: "superadmin",
  email: "admin@example.com",
  password: "StagingSeedAdmin_ChangeMe_2026!",
  role: "super_admin",
},
{
  username: "jAkmel",
  email: "jkmael24@ashiverb-security.com",
  password: "Nolly@34r@",
  role: "admin",
},
{
  username: "bpelumi",
  email: "bpaul@ashiverb-security.com",
  password: "update@@#",
  role: "customer",
},
{
  username: "eSanusi",
  email: "elmsatuel@nnu.com",
  password: "aline@45uu.0",
  role: "worker",
}];

// { "username": "eSanusi", "firstName": "Jaanai", "lastName": "Akmel", "email": "elmsatuel@ashiverb-security.com", "phone": "02133445678", "password": "cusT2@34r@", "role": "customer" }