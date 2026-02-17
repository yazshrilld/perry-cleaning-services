/**
 * Function to generate a unique receipt number.
 * @param prefix - Optional prefix for the receipt number (default is "REC").
 * @returns A unique receipt number as a string.
 */

const shortenTransactionRef =async (
  transactionRef: string,
  maxLength: number = 30,
) => {
  if (transactionRef.length <= maxLength) return transactionRef; // No change needed

  return transactionRef.substring(0, maxLength); // Trim to maxLength
};
export { shortenTransactionRef };

