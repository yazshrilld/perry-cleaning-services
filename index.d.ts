declare namespace Express {
  export interface Request {
    id: string;
    requestDetails: unknown;
    ACCESS_TOKEN: string;
    currentTokenDetails: any;
    loginUserDetails:any;
    USER_ROLES: string[];
    files?:
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
      | null; // Merged types from multer and express-fileupload
    file?: Express.Multer.File; // If you use a single file upload
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: string;
    scope: string;
    jti: string;
    idAlias: string;
    clientIp?: string;
    textData?: string;
  }
}
