import { Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      USER_ID?: string;
      USER_ROLES?: string[] | string;
      ACCESS_TOKEN?: string;
      currentTokenDetails?: any;
    }
  }
}

declare namespace Helpers {
  export type ResponseObjectProps = Record<string, unknown>;

  export type ResponseObjectFn = (
    res: Response,
    statusCode: number,
    message: string,
    payload?: unknown,
    responseStatusCode?: string | number,
    error?: unknown,
  ) => void;

  export type DataCheckerProps = Record<string, unknown>;

  export type DataCheckerResponse = {
    status: boolean;
    payload: Array<Record<string, string>>;
  };

  export type DataCheckerFn<T = DataCheckerProps> = (
    props: T,
  ) => DataCheckerResponse;

  export type HandlerResponse<T = unknown> = {
    status: boolean;
    message: string;
    payload: T;
  };

  export type ErrorHandlerFn<T = undefined> = (
    err: unknown,
    resourceDescription: string,
    payload: T,
  ) => HandlerResponse;

  export type SuccessHandlerFn<T = unknown> = (
    data: T,
    resourceDescription: string,
  ) => HandlerResponse<T>;

  export type ValidationTarget = "body" | "query" | "params" | "files";

  export type ExtendedRequest = {
    query: Record<string, unknown>;
    params: Record<string, unknown>;
    body: Record<string, unknown>;
  } & Request<
    Record<string, unknown>,
    unknown,
    unknown,
    Record<string, unknown>
  >;

  export type FetcherConfig = {
    method: Method;
    url: string;
    data?: Record<string, unknown> | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: Record<string, any>;
    query?: Record<string, unknown>;
    timeout?: number;
    headers?: Record<string, string>;
    onError?: (error: unknown) => void;
  };

  export type ApiParams = {
    ClientIp: string | null;
    [key: string]: unknown;
  };

  export type ErrorResponse = {
    message?: string;
    response?: {
      data: {
        message: string;
      };
    };
    status?: number;
    HttpError?: Error;
  };

  export type Timestamps = {
    createdAt: string;
    updatedAt: string;
  };

  export type ServiceResponse = {
    status: boolean;
    message: string;
    payload?: { [key: string]: unknown };
  };

  export type FilterOptions = {
    limit?: number; // Optional property
    offset?: number; // Optional property
    order?: [string, string][]; // Optional property
    where?: unknown;
  };

  export type FindInfoParams = {
    orderBy?: string;
    sort?: "ASC" | "DESC";
    size?: number;
    page?: number;
    gSearch?: string;
    filter?: Record<string, any>;
    status?: string;
    option?: string;
    startDate?: string;
    endDate?: string;
  };

  export type UserRoles = "CUSTOMER" | "GOV" | "ADMIN" | "SUPERADMIN";

  // Message Types
  export type MessageSender = {
    id: string;
    type: "visitor" | "agent" | "system";
  };

  export type MessageAttachment = {
    id: string;
    url: string;
    type: string;
    size: number;
    name: string;
  };

  export type MessageStatus = "sent" | "delivered" | "read" | "failed";

  export type Message = {
    messageId: string;
    conversationId: string;
    content: string;
    sender: MessageSender;
    timestamp: string;
    status: MessageStatus;
    attachments: MessageAttachment[];
  };

  export type MessageHistoryResponse = {
    messages: Message[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}
