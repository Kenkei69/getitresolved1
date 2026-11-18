import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default async function handler(req, res) {
  // Normalize request URL path
  const matchedPath = req.headers ? req.headers["x-matched-path"] : undefined;
  if (matchedPath && matchedPath.startsWith("/api")) {
    const queryIndex = (req.url || "").indexOf("?");
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    req.url = matchedPath + queryString;
  } else if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  // If BACKEND_URL service binding is injected by Vercel, forward to the internal backend service
  if (process.env.BACKEND_URL) {
    try {
      const targetUrl = new URL(req.url, process.env.BACKEND_URL);
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      });

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      const data = await response.arrayBuffer();
      return res.send(Buffer.from(data));
    } catch (err) {
      console.error("[Service Binding] Error forwarding to internal backend:", err);
      return res.status(502).json({
        success: false,
        message: "Failed to communicate with internal backend service."
      });
    }
  }

  // Fallback to direct Express app invocation (for local dev / direct function execution)
  const serverModule = require("../backend/server.js");
  const app = serverModule.app || serverModule;
  return app(req, res);
}
