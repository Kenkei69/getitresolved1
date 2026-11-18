const rateLimit = require("express-rate-limit");

// General API rate limiter (browsing, fetching complaints, health checks)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_GENERAL_MAX ? parseInt(process.env.RATE_LIMIT_GENERAL_MAX, 10) : 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true",
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests from this IP, please try again later."
        });
    }
});

// Strict rate limiter for complaint submissions (POST /api/complaints)
const createComplaintLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_CREATE_MAX ? parseInt(process.env.RATE_LIMIT_CREATE_MAX, 10) : 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true",
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many complaints submitted from this IP, please try again after 15 minutes."
        });
    }
});

// Targeted rate limiter for tracking ID lookups (GET /api/complaints/:trackingId)
const trackingLookupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_TRACK_MAX ? parseInt(process.env.RATE_LIMIT_TRACK_MAX, 10) : 60,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true",
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many tracking lookups from this IP, please try again later."
        });
    }
});

module.exports = {
    generalLimiter,
    createComplaintLimiter,
    trackingLookupLimiter
};

