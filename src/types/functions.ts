import type { Response ,Request} from "express";

export type ResponseObjectFn = (props: {
  res: Response;
  statusCode: number;
  message: string;
  payload?: unknown;
  responseStatusCode?: string | number;
  status?: boolean;
}) => void;


export type OpenAIStreamPayload = {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream: boolean;
  user?: string;
  n?: number;
};

export type TokenPayload= {
  userId: string;
  // Add any other fields expected in your JWT payload
  [key: string]: any;
}

export type DecodeResult =
  | { valid: true; decodeResult: TokenPayload }
  | { valid: false; reason: any };

export enum rolePermissions {
  CREATE = "CREATE",
  DELETE = "DELETE",
  EDIT = "EDIT",
  UPDATE = "UPDATE",
  VIEW = "VIEW",
  READ = "READ",
}

// Define the config interface
export type StrategyConfig = {
  clientID: string;
  clientSecret: string;
}

// Extend Express Request to include OAuth user
export type OAuthProfile = {
  photos: any;
  _json: any;
  id: string;
  provider: "google" | "github";
  displayName: string;
  emails?: { value: string }[];
};

// Define the OAuth user structure
export type OAuthUser = {
  accessToken: string;
  profile: OAuthProfile;
};

// Extend Express Request to define a custom `user` property
export type OAuthRequest = {
  user: OAuthUser | any; // Initially OAuthUser, later replaced by DB user
} & Request


export type WalletRequestParams = {
  id: string;
  walletId: string;
  range?: string; // Optional range for filtering transactions
  requestType?: "dashboard" | "other"; // Restrict to specific values
}