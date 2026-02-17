import { RequestHandler } from "express";

const forbiddenPaths: RequestHandler = (req, res, next) => {
  const forbiddenPaths = [".env", ".git", ".htaccess"];
  const requestPath = req.path.toLowerCase();

  for (const path of forbiddenPaths) {
    if (requestPath.includes(path)) {
      return res.status(403).send("Forbidden");
    }
  }

  next();
};

export default forbiddenPaths;
