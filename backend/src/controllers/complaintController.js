const supabase = require("../config/supabase");

// Helper regex to validate tracking ID format (e.g., JS-2026-1234)
const TRACKING_ID_REGEX = /^JS-2026-\d{4}$/i;

// Helper function to generate tracking ID (e.g., JS-2026-8901)
const generateTrackingId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `JS-2026-${randomDigits}`;
};

// Maximum allowed lengths for input validation
const MAX_LENGTHS = {
    title: 200,
    description: 2000,
    location: 200,
    category: 100,
    department: 100
};

// Get all complaints with search, filtering and optional pagination
const getAllComplaints = async (req, res) => {
    try {
        const { search, department, category, status, page, limit } = req.query;

        const isPaginationRequested = page !== undefined || limit !== undefined;
        let pageNum = 1;
        let limitNum = 10;

        // Validate pagination parameters when requested
        if (isPaginationRequested) {
            if (page !== undefined) {
                if (!/^\d+$/.test(String(page).trim()) || parseInt(page, 10) < 1) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid page parameter. Page must be a positive integer greater than or equal to 1."
                    });
                }
                pageNum = parseInt(page, 10);
            }

            if (limit !== undefined) {
                if (!/^\d+$/.test(String(limit).trim()) || parseInt(limit, 10) < 1 || parseInt(limit, 10) > 100) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid limit parameter. Limit must be an integer between 1 and 100."
                    });
                }
                limitNum = parseInt(limit, 10);
            }
        }

        // Base query with exact count when pagination is requested
        let query = supabase
            .from("complaints")
            .select("*", isPaginationRequested ? { count: "exact" } : undefined);

        // Case-insensitive search across title, description, location, and tracking_id
        if (search && typeof search === "string" && search.trim()) {
            const sanitized = search.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            const pattern = `"%${sanitized}%"`;
            query = query.or(`title.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern},tracking_id.ilike.${pattern}`);
        }

        // Filter by department
        if (department && typeof department === "string" && department.trim() && department.trim() !== "All") {
            query = query.eq("department", department.trim());
        }

        // Filter by category
        if (category && typeof category === "string" && category.trim() && category.trim() !== "All") {
            query = query.eq("category", category.trim());
        }

        // Filter by status
        if (status && typeof status === "string" && status.trim() && status.trim() !== "All") {
            query = query.eq("status", status.trim());
        }

        // Preserve created_at descending sort order
        query = query.order("created_at", { ascending: false });

        // Apply range pagination if requested
        if (isPaginationRequested) {
            const from = (pageNum - 1) * limitNum;
            const to = from + limitNum - 1;
            query = query.range(from, to);
        }

        const { data, count, error } = await query;

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch complaints from database.",
                error: error.message
            });
        }

        // If pagination was requested, include pagination metadata
        if (isPaginationRequested) {
            const total = count !== null ? count : (data ? data.length : 0);
            return res.status(200).json({
                success: true,
                count: data ? data.length : 0,
                page: pageNum,
                limit: limitNum,
                totalRecords: total,
                totalPages: total > 0 ? Math.ceil(total / limitNum) : 0,
                complaints: data || []
            });
        }

        // Default response structure when no pagination is requested
        res.status(200).json({
            success: true,
            count: data ? data.length : 0,
            complaints: data || []
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching complaints.",
            error: err.message
        });
    }
};

// Submit complaint - Inserts permanently into Supabase
const createComplaint = async (req, res) => {
    try {
        // Validate request body existence
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body cannot be empty and must be a valid JSON object."
            });
        }

        const { title, description, location, category, department } = req.body;

        // 1. Validate required field: title
        if (title === undefined || title === null || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required and cannot be empty or whitespace-only."
            });
        }
        if (title.trim().length > MAX_LENGTHS.title) {
            return res.status(400).json({
                success: false,
                message: `Title cannot exceed ${MAX_LENGTHS.title} characters.`
            });
        }

        // 2. Validate required field: description
        if (description === undefined || description === null || typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description is required and cannot be empty or whitespace-only."
            });
        }
        if (description.trim().length > MAX_LENGTHS.description) {
            return res.status(400).json({
                success: false,
                message: `Description cannot exceed ${MAX_LENGTHS.description} characters.`
            });
        }

        // 3. Validate required field: location
        if (location === undefined || location === null || typeof location !== "string" || !location.trim()) {
            return res.status(400).json({
                success: false,
                message: "Location is required and cannot be empty or whitespace-only."
            });
        }
        if (location.trim().length > MAX_LENGTHS.location) {
            return res.status(400).json({
                success: false,
                message: `Location cannot exceed ${MAX_LENGTHS.location} characters.`
            });
        }

        // 4. Validate optional field: category
        if (category !== undefined && category !== null) {
            if (typeof category !== "string" || !category.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category must be a non-empty string if provided."
                });
            }
            if (category.trim().length > MAX_LENGTHS.category) {
                return res.status(400).json({
                    success: false,
                    message: `Category cannot exceed ${MAX_LENGTHS.category} characters.`
                });
            }
        }

        // 5. Validate optional field: department
        if (department !== undefined && department !== null) {
            if (typeof department !== "string" || !department.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Department must be a non-empty string if provided."
                });
            }
            if (department.trim().length > MAX_LENGTHS.department) {
                return res.status(400).json({
                    success: false,
                    message: `Department cannot exceed ${MAX_LENGTHS.department} characters.`
                });
            }
        }

        // Prepare sanitized payload
        const tracking_id = generateTrackingId();
        const insertPayload = {
            tracking_id,
            title: title.trim(),
            description: description.trim(),
            location: location.trim()
        };

        if (category && typeof category === "string" && category.trim()) {
            insertPayload.category = category.trim();
        }
        if (department && typeof department === "string" && department.trim()) {
            insertPayload.department = department.trim();
        }

        const { data, error } = await supabase
            .from("complaints")
            .insert([insertPayload])
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to save complaint to database.",
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully!",
            tracking_id: data.tracking_id,
            complaint: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred while submitting complaint.",
            error: err.message
        });
    }
};

// Get single complaint by tracking ID from Supabase
const getComplaintByTrackingId = async (req, res) => {
    try {
        const { trackingId } = req.params;

        // Validate tracking ID format before querying Supabase
        if (!trackingId || typeof trackingId !== "string" || !TRACKING_ID_REGEX.test(trackingId.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid tracking ID format. Expected format: JS-2026-XXXX (e.g., JS-2026-1234)."
            });
        }

        const normalizedTrackingId = trackingId.trim();
        const isTracking = TRACKING_ID_REGEX.test(normalizedTrackingId);

        let query = supabase.from("complaints").select("*");
        if (isTracking) {
            query = query.eq("tracking_id", normalizedTrackingId.toUpperCase());
        } else {
            query = query.eq("id", normalizedTrackingId);
        }

        const { data, error } = await query.single();

        if (error) {
            // PostgREST code PGRST116 means 0 rows matched .single()
            if (error.code === "PGRST116" || !data) {
                return res.status(404).json({
                    success: false,
                    message: `Complaint with tracking ID '${normalizedTrackingId}' not found.`
                });
            }
            return res.status(500).json({
                success: false,
                message: "Failed to fetch complaint from database.",
                error: error.message
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: `Complaint with tracking ID '${normalizedTrackingId}' not found.`
            });
        }

        res.status(200).json({
            success: true,
            complaint: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching the complaint.",
            error: err.message
        });
    }
};

// Increment upvotes on a complaint
const upvoteComplaint = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const identifier = (trackingId || req.params.id || "").trim();

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: "Complaint identifier (tracking ID or ID) is required."
            });
        }

        const isTracking = TRACKING_ID_REGEX.test(identifier);
        let query = supabase.from("complaints").select("id, tracking_id, upvotes");
        if (isTracking) {
            query = query.eq("tracking_id", identifier.toUpperCase());
        } else {
            query = query.eq("id", identifier);
        }

        const { data: existing, error: findError } = await query.single();
        if (findError || !existing) {
            return res.status(404).json({
                success: false,
                message: `Complaint '${identifier}' not found.`
            });
        }

        const currentUpvotes = Number(existing.upvotes) || 0;
        const nextUpvotes = currentUpvotes + 1;

        const { data: updated, error: updateError } = await supabase
            .from("complaints")
            .update({
                upvotes: nextUpvotes,
                updated_at: new Date().toISOString()
            })
            .eq("id", existing.id)
            .select()
            .single();

        if (updateError || !updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to record upvote in database.",
                error: updateError?.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Upvote recorded successfully!",
            upvotes: updated.upvotes,
            complaint: updated
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred while upvoting.",
            error: err.message
        });
    }
};

// Update complaint status or details by tracking ID or UUID
const updateComplaint = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const identifier = (trackingId || req.params.id || "").trim();

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: "Identifier parameter (tracking ID or ID) is required."
            });
        }

        const { status, description, department, category, title } = req.body || {};

        const updatePayload = {
            updated_at: new Date().toISOString()
        };

        if (status !== undefined && status !== null) updatePayload.status = String(status).trim();
        if (description !== undefined && description !== null) updatePayload.description = String(description).trim();
        if (department !== undefined && department !== null) updatePayload.department = String(department).trim();
        if (category !== undefined && category !== null) updatePayload.category = String(category).trim();
        if (title !== undefined && title !== null) updatePayload.title = String(title).trim();

        const isTracking = TRACKING_ID_REGEX.test(identifier);
        let query = supabase.from("complaints").update(updatePayload);

        if (isTracking) {
            query = query.eq("tracking_id", identifier.toUpperCase());
        } else {
            query = query.eq("id", identifier);
        }

        const { data, error } = await query.select();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update complaint in database.",
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Complaint '${identifier}' not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Complaint updated successfully!",
            complaint: data[0]
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating the complaint.",
            error: err.message
        });
    }
};

// Citizen feedback submission handler
const submitFeedback = async (req, res) => {
    try {
        const { name, contact, type, message } = req.body || {};
        if (!contact || !contact.trim() || !message || message.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: "Contact and a descriptive message (minimum 5 characters) are required."
            });
        }

        const feedbackId = `FB-${Date.now().toString(36).toUpperCase()}`;
        console.log(`[Citizen Feedback] ID: ${feedbackId} | Type: ${type} | Contact: ${contact.trim()} | Name: ${name?.trim() || 'Anonymous'}`);

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully! Thank you for helping us improve.",
            feedbackId
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred while submitting feedback.",
            error: err.message
        });
    }
};

module.exports = {
    getAllComplaints,
    createComplaint,
    getComplaintByTrackingId,
    upvoteComplaint,
    updateComplaint,
    submitFeedback
};


