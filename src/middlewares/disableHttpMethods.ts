import { RequestHandler } from "express";

const disableHttpMethods: RequestHandler = (req, res, next) => {
  if (req.method === "TRACE" || req.method === "DELETE") {
    return res.status(405).send("Method Not Allowed");
  }
  next();
};

export default disableHttpMethods;
