export const createHttpError = (
  message: string | undefined,
  statusCode: number,
) => {
  const error = new Error(message) as Error & { status: number };
  error.status = statusCode;
  return error;
};
