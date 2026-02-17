export const sanitizeInput = (input: string): string => {
  // Check if the input is a valid date
  if (!isNaN(Date.parse(input))) {
    return input.trim();
  }

  return input.replace(/[^a-zA-Z0-9_]/g, "").trim();
};
