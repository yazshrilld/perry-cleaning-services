

export const getRawHeader = async (rawHeaders: string[], headerName: string): Promise<string | null> => {
  for (let i = 0; i < rawHeaders.length; i += 2) {
    if (rawHeaders[i].toLowerCase() === headerName.toLowerCase()) {
      return rawHeaders[i + 1];
    }
  }
  return null;
};