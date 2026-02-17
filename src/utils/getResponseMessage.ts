const responseMessages: Record<string, string> = {
  "00": "Operation Successful",
  "01": "Request failed; fund reversed",
  "87": "Data Integrity Compromise",
};

export const getResponseMessage = (code: string): string => {
  return responseMessages[code] || "Unknown response code";
};
