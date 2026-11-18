const express = require("express");
const {
    getAllComplaints,
    createComplaint,
    getComplaintByTrackingId
} = require("../controllers/complaintController");
const {
    createComplaintLimiter,
    trackingLookupLimiter
} = require("../middlewares/rateLimiter");

const router = express.Router();

router.get("/", getAllComplaints);
router.get("/:trackingId", trackingLookupLimiter, getComplaintByTrackingId);
router.post("/", createComplaintLimiter, createComplaint);

module.exports = router;

