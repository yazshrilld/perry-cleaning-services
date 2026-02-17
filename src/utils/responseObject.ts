import { ResponseObjectFn } from "../types";

export const responseObject: ResponseObjectFn = (props) => {
  const {
    res,
    statusCode,
    message,
    payload = undefined,
    status = false,
  } = props;

  res.set("Cache-Control", "no-store");

  let responseObject: {
    code: number;
    message: string;
    payload: unknown;
    status?: boolean;
  } = {
    code: statusCode,
    message,
    payload,
  };

  if (statusCode) {
    responseObject = {
      ...responseObject,
      status: statusCode >= 200 && statusCode <= 300,
    };
  }

  if (status) {
    responseObject = {
      ...responseObject,
      status,
    };
  }

  return res.status(statusCode).send(responseObject);
};
