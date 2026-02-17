import bcrypt from "bcryptjs";
import { usersModel } from "../../models";
import { usersSchemaType } from "../../models/types";

const { UsersModel } = usersModel;

const getSaltRounds = (): number => {
  const envPrefix =
    process.env.NODE_ENV === "staging" ? "STAGING_" : "PRODUCTION_";
  const rounds = Number(
    process.env[`${envPrefix}PASSWORD_ENCRYPTION_SALT`] || "10",
  );
  return Number.isNaN(rounds) ? 10 : rounds;
};

export type CreateUserPayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  companyId?: string;
  name?: string;
  picture?: string;
  address?: string;
  country?: string;
  role?: string;
  roles?: string[];
};

export const createUser = async (
  payload: CreateUserPayload,
): Promise<usersSchemaType> => {
  const hashedPassword = await bcrypt.hash(payload.password, getSaltRounds());

  const resolvedRole = payload.role || "admin";
  const resolvedRoles =
    payload.roles && payload.roles.length > 0 ? payload.roles : [resolvedRole];

  return await UsersModel.create({
    ...payload,
    role: resolvedRole,
    roles: resolvedRoles,
    password: hashedPassword,
  });
};

export const findByEmailOrUsername = async (
  identifier: string,
): Promise<usersSchemaType | null> => {
  return await UsersModel.findOne({
    $and: [
      {
        $or: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
      {
        $or: [{ isActive: true }, { isActive: { $exists: false } }],
      },
    ],
  });
};

export const verifyPassword = async (
  plain: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};

export const setLastLogin = async (userId: string): Promise<void> => {
  await UsersModel.updateOne({ _id: userId }, { lastLogin: new Date() });
};

export const sanitize = (
  user: usersSchemaType,
): Omit<usersSchemaType, "password"> => {
  const userObj = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, ...safeUser } = userObj as usersSchemaType & {
    password?: string;
  };
  return safeUser as Omit<usersSchemaType, "password">;
};
