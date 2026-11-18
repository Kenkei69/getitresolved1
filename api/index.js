import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serverModule = require("../backend/server.js");
const app = serverModule.app || serverModule;

export default function handler(req, res) {
  // Normalize request URL in Vercel serverless environment
  const matchedPath = req.headers ? req.headers["x-matched-path"] : undefined;
  if (matchedPath && matchedPath.startsWith("/api")) {
    const queryIndex = (req.url || "").indexOf("?");
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    req.url = matchedPath + queryString;
  } else if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  return app(req, res);
}
