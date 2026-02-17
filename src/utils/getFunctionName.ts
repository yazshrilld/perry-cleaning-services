export const getFunctionName = (): string => {
  try {
    const error = new Error();
    const stackLines = error.stack?.split("\n");
    if (stackLines && stackLines.length >= 4) {
      const functionName = stackLines[3].trim().split(" ")[1];
      return functionName;
    } else {
      return "unknown resource name";
    }
  } catch (error) {
    return "unknown resource name";
    console.log("Error getting function name:", (error as Error).message);
  }
};
