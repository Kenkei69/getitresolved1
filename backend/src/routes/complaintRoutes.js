const express = require("express");
const {
    getAllComplaints,
    createComplaint,
    getComplaintByTrackingId,
    upvoteComplaint,
    updateComplaint
} = require("../controllers/complaintController");
const {
    createComplaintLimiter,
    trackingLookupLimiter
} = require("../middlewares/rateLimiter");

const router = express.Router();

router.get("/", getAllComplaints);
router.get("/:trackingId", trackingLookupLimiter, getComplaintByTrackingId);
router.post("/", createComplaintLimiter, createComplaint);
router.post("/:trackingId/upvote", upvoteComplaint);
router.patch("/:trackingId", updateComplaint);
router.put("/:trackingId", updateComplaint);

module.exports = router;

