import { Request, Response, NextFunction } from "express";

export const captureResponseBody = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any) {
    res.locals.body = body; // Store the response body in res.locals
    return originalSend.apply(res, [body]); // Continue with the original response
  };

  next();
};

