async function replaceVariables(
  template: string,
  variables: { [key: string]: string },
): Promise<string> {
  let body = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    body = body.replace(regex, value);
  }
  return body;
}


async function normalizeResponse(response: any) {
  console.log(response,"iiooooiioooo");
  return {
    sessionId: response?.SessionId || response?.sessionId || "N/A",
    responseCode: response?.ResponseCode || response?.responseCode || "N/A",
    responseDescription:
      response?.ResponseDescription || response?.responseDescription || "N/A",
  };
}

export { replaceVariables, normalizeResponse };