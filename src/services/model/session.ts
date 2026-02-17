import { sessionModel } from "../../models";
import { sessionSchemaType } from "../../models/types";

const { SessionsModel } = sessionModel;

export const createSession = async (data:any): Promise<sessionSchemaType> => {
  return await SessionsModel.create(data);
};

// export const findSessionByToken = async (
//   token: string,
// ): Promise<Session | null> => {
//   return await prisma.session.findUnique({
//     where: { token },
//   });
// };

// export const deleteSession = async (token: string): Promise<void> => {
//   await prisma.session.delete({
//     where: { token },
//   });
// };

// export const deleteExpiredSessions = async (): Promise<void> => {
//   await prisma.session.deleteMany({
//     where: {
//       expiresAt: {
//         lt: new Date(),
//       },
//     },
//   });
// };

// export const deleteUserSessions = async (userId: string): Promise<void> => {
//   await prisma.session.deleteMany({
//     where: { userId },
//   });
// };
