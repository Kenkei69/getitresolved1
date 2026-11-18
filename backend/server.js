const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const supabase = require("./src/config/supabase");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const complaintRoutes = require("./src/routes/complaintRoutes");
const { submitFeedback } = require("./src/controllers/complaintController");
const { generalLimiter } = require("./src/middlewares/rateLimiter");

const app = express();

// Trust reverse proxy in production environments
if (process.env.NODE_ENV === "production" || process.env.REPL_ID) {
    app.set("trust proxy", 1);
}

// 1. HTTP Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// 2. CORS configuration with explicit allowlist and dev flexibility
const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : []);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
        if (!origin) return callback(null, true);
        // Allow any localhost / 127.0.0.1 origin during development or testing
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        if (process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        return callback(new Error(`Origin '${origin}' not allowed by CORS policy.`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));

// 3. Request size protection (10KB limit for JSON bodies)
app.use(express.json({ limit: "10kb" }));

// 4. Handle JSON parse errors, payload too large, and CORS rejections
app.use((err, req, res, next) => {
    if (err.type === "entity.too.large" || err.status === 413) {
        return res.status(413).json({
            success: false,
            message: "Payload too large. Request body exceeds the maximum allowed limit of 10KB."
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Malformed JSON payload in request body."
        });
    }

    if (err.message && err.message.includes("CORS policy")) {
        return res.status(403).json({
            success: false,
            message: err.message
        });
    }

    next(err);
});

// 5. Rate Limiting: General API rate limiter across all /api routes
app.use("/api", generalLimiter);

// Routes
app.use("/api/complaints", complaintRoutes);
app.post("/api/feedback", submitFeedback);

// Test API - Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GetItResolved Backend is Running!"
    });
});

// Test API - Supabase Database connectivity
app.get("/api/test-db", async (req, res) => {
    try {
        const { error } = await supabase
            .from("complaints")
            .select("id")
            .limit(1);

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed."
            });
        }

        res.status(200).json({
            success: true,
            message: "Supabase database connected successfully!"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

// Serve frontend static build files (production / unified mode)
const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Client-side SPA routing fallback for non-API GET/HEAD requests
app.use((req, res, next) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || req.path.startsWith("/api")) {
        return next();
    }
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    next();
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error."
    });
});

// Server (only start listening when run directly, not in serverless environments like Vercel)
let server = null;
if (!process.env.VERCEL && require.main === module) {
    const PORT = parseInt(process.env.PORT || "5000", 10);
    server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`GetItResolved Backend running on http://localhost:${PORT}`);
    });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
