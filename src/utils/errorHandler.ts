/* eslint-disable require-jsdoc */
import { logger } from "netwrap";
import { getFunctionName } from "./getFunctionName";

// Define a proper error response type
type ErrorResponse = {
  status: number;
  statusCode?: number;
  message: string;
  response?: {
    status: number;
    data: {
      message: string;
    };
  };
}

type HandlerResponse<L> = {
  status: boolean;
  statusCode: number;
  message: string;
  payload: L | null;
}

function errorHandler<T = unknown, L = undefined>(
  err: T,
  payload: L | null = null,
  defaultMessage = "An error occurred when fetching resource",
  resourceDescription?: string,
): HandlerResponse<L> {
  // Cast the error to our expected type
  const error = err as ErrorResponse;

  // Log the error with consistent format
  logger(
    {
      error,
      resourceDescription:
        resourceDescription || `Function: ${getFunctionName()} had an error`,
      timestamp: new Date().toISOString(),
    },
    { shouldLog: true, isError: false },
  );

  // Default error response
  const defaultResponse: HandlerResponse<L> = {
    status: false,
    statusCode: 500, // Default to internal server error
    message: defaultMessage,
    payload,
  };

  try {
    // Case 1: Error has direct status and message
    if (error.status) {
      return {
        status: false,
        statusCode: error.status,
        message: error.message || defaultMessage,
        payload,
      };
    }

    // Case 2: Error has response object (typically from axios or similar)
    if (error.response?.data) {
      return {
        status: false,
        statusCode: error.response.status || 500,
        message: error.response.data.message || defaultMessage,
        payload,
      };
    }

    // Case 3: Error has only message
    if (error.message) {
      return {
        status: false,
        statusCode: error.status || error.statusCode || 500,
        message: error.message,
        payload,
      };
    }

    // Case 4: Unknown error structure
    if (error instanceof Error) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || defaultMessage,
        payload,
      };
    }

    // Default case: return default response
    return defaultResponse;
  } catch (innerError) {
    // If anything goes wrong while handling the error, return default response
    logger(
      {
        error: innerError,
        message: "Error occurred in errorHandler itself",
        originalError: error,
      },
      { shouldLog: true, isError: true },
    );
    return defaultResponse;
  }
}

export { errorHandler };
