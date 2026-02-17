const extractHeaders =async (headers: any) => {
  let authorization = "";
  let signature = "";
  
  for (let i = 0; i < headers.length; i += 2) {
    const headerName = headers[i];
    const headerValue = headers[i + 1];
  
    if (headerName.toLowerCase() === "signature") {
      signature = headerValue;
    } else if (headerName.toLowerCase() === "authorization") {
      authorization = headerValue;
    }
  }
  
  return { authorization, signature };
};

export {
  extractHeaders
};