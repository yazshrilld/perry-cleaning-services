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
