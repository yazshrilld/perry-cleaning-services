import { randomInt } from "crypto";

/**
 * Generates a unique numeric transaction reference.
 * @param length - The total length of the transaction reference (default: 30).
 * @param useShortTimestamp - If true, uses a shorter timestamp (YYMMDDHHMM instead of YYYYMMDDHHMMSS).
 * @returns A promise that resolves to a unique transaction reference string.
 */
export const generateTransactionRef = async (
  length: number = 30,
  useShortTimestamp: boolean = false,
): Promise<string> => {
  // Ensure the length is within a valid range
  if (length < 10 || length > 30) {
    throw new Error(
      "Transaction reference length must be between 10 and 30 digits.",
    );
  }

  // Generate timestamp in YYYYMMDDHHMMSS or YYMMDDHHMM format
  const now = new Date();
  const fullTimestamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14); // YYYYMMDDHHMMSS
  const shortTimestamp = fullTimestamp.slice(2, 12); // YYMMDDHHMM
  const timestamp = useShortTimestamp ? shortTimestamp : fullTimestamp;

  // Generate the remaining random digits
  const randomPartLength = length - timestamp.length;
  const randomNumeric = Array.from({ length: randomPartLength }, () =>
    randomInt(0, 9),
  ).join("");

  // Construct final transaction reference
  const transactionRef = `${timestamp}${randomNumeric}`;

  return transactionRef;
};
