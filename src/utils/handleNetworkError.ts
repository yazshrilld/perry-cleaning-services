/**
 * Handles network-related errors and returns structured error information.
 * @param error - The network error to handle,
 * expected to have an optional `code` and `response`.
 * @returns An object containing `statusCode`,
 * `message`, and `payload` for the error response.
 */
export function handleNetworkError(error: {
  code?: string;
  message: string;
  response?: {
    status: number;
    data: { message?: string; [key: string]: unknown };
  };
}) {
  let statusCode = 503;
  let message = `A critical error occurred. Kindly contact admin for details 
  about a possible solution to this error.`;
  let payload: Record<string, unknown> = { error: error.message };

  if (error.code) {
    switch (error.code) {
    case "ENOTFOUND":
      message = `DNS resolution error. The service might be down or the 
        URL is incorrect.`;
      break;
    case "ECONNREFUSED":
      message = `Connection refused. The service might be down or refusing 
        connections.`;
      break;
    case "ETIMEDOUT":
      message = `Connection timed out. The service might be taking too 
        long to respond.`;
      break;
    case "EHOSTUNREACH":
      message = `Host unreachable. The service might be down or there might 
        be a network issue.`;
      break;
    case "ENETUNREACH":
      message = "Network unreachable. There might be a network issue.";
      break;
    case "ECONNRESET":
      message = `Connection reset by peer. The service might have reset 
        the connection.`;
      break;
    default:
      message = `An unknown network error occurred. -- ${error.message}`;
    }
  } else if (error.response) {
    payload = error.response.data;
    statusCode = error.response.status;
    message = error.response.data.message || error.message || message;
  } else {
    message = `${message} ----- ${error.message}`;
  }

  return { statusCode, message, payload };
}
