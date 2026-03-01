import { usersModel } from "../../models";
import { usersSchemaType } from "../../models/types";

const { UsersModel } = usersModel;

type GetCustomersQuery = {
  page?: number | string;
  size?: number | string;
  limit?: number | string;
  gSearch?: string;
  search?: string;
};

type UpdateCustomerPayload = Partial<{
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  country: string;
  picture: string;
  name: string;
}>;

const getPagination = (query: GetCustomersQuery) => {
  const page = Number(query.page || 1);
  const rawLimit = Number(query.limit || query.size || 10);

  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit =
    Number.isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

export const sanitizeCustomer = (
  user: usersSchemaType,
): Omit<usersSchemaType, "password"> => {
  const userObj = typeof user.toObject === "function" ? user.toObject() : user;
  const { password: removedPassword, ...safeUser } =
    userObj as usersSchemaType & {
      password?: string;
    };
  void removedPassword;
  return safeUser as unknown as Omit<usersSchemaType, "password">;
};

export const listCustomers = async (query: GetCustomersQuery) => {
  const { page, limit, skip } = getPagination(query);
  const search = String(query.search || query.gSearch || "").trim();

  const roleFilter = {
    $or: [{ role: "customer" }, { roles: { $in: ["customer"] } }],
  };

  const activeFilter = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  };

  const searchFilter = search
    ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const filter = {
    $and: [roleFilter, activeFilter, searchFilter],
  };

  const [rows, total] = await Promise.all([
    UsersModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UsersModel.countDocuments(filter),
  ]);

  return {
    data: rows.map((row) => sanitizeCustomer(row as usersSchemaType)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCustomerById = async (id: string) => {
  return await UsersModel.findOne({
    _id: id,
    $and: [
      {
        $or: [{ role: "customer" }, { roles: { $in: ["customer"] } }],
      },
      {
        $or: [{ isActive: true }, { isActive: { $exists: false } }],
      },
    ],
  });
};

export const updateCustomer = async (
  id: string,
  payload: UpdateCustomerPayload,
) => {
  const allowedFields = [
    "username",
    "firstName",
    "lastName",
    "phone",
    "address",
    "country",
    "picture",
    "name",
  ];

  const updatePayload: Record<string, unknown> = {};
  Object.keys(payload || {}).forEach((key) => {
    if (allowedFields.includes(key)) {
      updatePayload[key] = (payload as Record<string, unknown>)[key];
    }
  });

  return await UsersModel.findOneAndUpdate(
    {
      _id: id,
      $or: [{ role: "customer" }, { roles: { $in: ["customer"] } }],
    },
    updatePayload,
    { new: true },
  );
};

export const softDeleteCustomer = async (id: string, actorId?: string) => {
  return await UsersModel.findOneAndUpdate(
    {
      _id: id,
      $or: [{ role: "customer" }, { roles: { $in: ["customer"] } }],
    },
    {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: actorId || null,
    },
    { new: true },
  );
};

export default {
  sanitizeCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  softDeleteCustomer,
};
