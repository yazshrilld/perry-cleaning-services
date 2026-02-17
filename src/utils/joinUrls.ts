export const joinUrls = (urlStrings: string | string[]): string => {
  const ensureLeadingSlash = (str: string): string => {
    return str.startsWith("/") ? str : `/${str}`;
  };

  if (typeof urlStrings === "string") {
    return ensureLeadingSlash(urlStrings);
  }

  if (Array.isArray(urlStrings)) {
    const joinedUrl = urlStrings.map((str) => ensureLeadingSlash(str)).join("");

    return joinedUrl;
  }

  throw new Error("Argument must be a string or an array of strings");
};
