import { RequestHandler } from "express";

const requestHeaderInspection: RequestHandler = (req, res, next) => {
  const userAgent = req.get("User-Agent");
  if (!userAgent || userAgent.includes("badbot")) {
    return res.status(403).send("Forbidden");
  }
  next();
};

export default requestHeaderInspection;


// More realistic Patterns
// import { RequestHandler } from "express";
// const BLOCKED_UA_PATTERNS = [
//   /badbot/i,
//   /sqlmap/i,
//   /nmap/i,
//   /acunetix/i,
//   /nikto/i,
//   /masscan/i,
//   /crawler/i,
//   /spider/i,
// ];

// const ALLOWED_BROWSERS = [
//   /chrome/i,
//   /firefox/i,
//   /safari/i,
//   /edge/i,
//   /opera/i,
// ];

// const requestHeaderInspection: RequestHandler = (req, res, next) => {
//   const userAgent = (req.get("User-Agent") || "").trim();

//   // Block missing UA or known malicious patterns.
//   if (!userAgent || BLOCKED_UA_PATTERNS.some((re) => re.test(userAgent))) {
//     return res.status(403).send("Forbidden");
//   }

//   // If you want to allow only common browsers, enable this check.
//   const allowOnlyBrowsers = false;
//   if (
//     allowOnlyBrowsers &&
//     !ALLOWED_BROWSERS.some((re) => re.test(userAgent))
//   ) {
//     return res.status(403).send("Forbidden");
//   }

//   next();
// };

// export default requestHeaderInspection;

