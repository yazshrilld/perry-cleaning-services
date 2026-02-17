
/* eslint-disable  @typescript-eslint/no-explicit-any */



export type AppUrlsType = {
  backendPort: string | undefined;
  frontendUrl: string;
  backendUrl: string;
  callBackUrl: string | undefined;
  apiDocsUrl: string | undefined;
  WEBSOCKET_URL: string | undefined;  
};

export type mailerType ={
   fromAddress: string | undefined;
  server: string | undefined;
  username: string | undefined;
  password: string | undefined;
}

export type CacheEntry = {
  value: string;
  expires: number; // timestamp in ms
};
