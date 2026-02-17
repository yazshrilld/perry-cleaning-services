export const addIfNotEmpty = (
  payload: Record<string, unknown>,
  key: string,
  value: unknown,
) => {
  if (value !== undefined && value !== null && value !== "") {
    payload[key] = value;
  }
};
