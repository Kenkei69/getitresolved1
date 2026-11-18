process.env.NODE_ENV = "production";
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../server");

describe("GetItResolved Backend API & Security Test Suite", () => {
    let server;
    let baseUrl;
    let createdTrackingId;

    const makeRequest = ({ path, method = "GET", headers = {}, body = null }) => {
        return new Promise((resolve, reject) => {
            const url = new URL(path, baseUrl);
            const reqHeaders = { ...headers };
            let payload = null;

            if (body && typeof body === "object") {
                payload = JSON.stringify(body);
                reqHeaders["Content-Type"] = "application/json";
                reqHeaders["Content-Length"] = Buffer.byteLength(payload);
            } else if (body) {
                payload = body;
                reqHeaders["Content-Length"] = Buffer.byteLength(payload);
            }

            const req = http.request(url, { method, headers: reqHeaders }, (res) => {
                let responseBody = "";
                res.on("data", (chunk) => {
                    responseBody += chunk;
                });
                res.on("end", () => {
                    let parsedJson = null;
                    try {
                        parsedJson = JSON.parse(responseBody);
                    } catch {
                        // Not JSON
                    }
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: responseBody,
                        json: parsedJson
                    });
                });
            });

            req.on("error", reject);
            if (payload) req.write(payload);
            req.end();
        });
    };

    before(() => {
        return new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    after(() => {
        return new Promise((resolve) => {
            if (server) {
                server.close(resolve);
            } else {
                resolve();
            }
        });
    });

    test("1. GET /api/health returns running status and database status", async () => {
        const res = await makeRequest({ path: "/api/health" });
        assert.equal(res.status, 200);
        assert.equal(res.json.success, true);
        assert.equal(res.json.message, "GetItResolved Backend is Running!");
        assert.equal(typeof res.json.database, "string");
    });

    test("2. OPTIONS /api/complaints preflight returns 204 with CORS headers for production domain", async () => {
        const res = await makeRequest({
            path: "/api/complaints",
            method: "OPTIONS",
            headers: {
                "Origin": "https://getitresolved1-sus2.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        });
        assert.equal(res.status, 204);
        assert.equal(res.headers["access-control-allow-origin"], "https://getitresolved1-sus2.vercel.app");
        assert.equal(res.headers["access-control-allow-credentials"], "true");
        assert.match(res.headers["access-control-allow-methods"], /POST/);
    });

    test("3. POST /api/complaints rejects unapproved third-party origin with 403 Forbidden", async () => {
        const res = await makeRequest({
            path: "/api/complaints",
            method: "POST",
            headers: {
                "Origin": "https://unauthorized-attacker.com",
                "Host": "api.getitresolved.org"
            },
            body: {
                title: "Malicious submission",
                description: "This should be blocked",
                location: "Unknown"
            }
        });
        assert.equal(res.status, 403);
        assert.equal(res.json.success, false);
        assert.equal(res.json.message, "Origin 'https://unauthorized-attacker.com' not allowed by CORS policy.");
    });

    test("4. POST /api/complaints rejects empty payload with 400 Bad Request", async () => {
        const res = await makeRequest({
            path: "/api/complaints",
            method: "POST",
            body: {}
        });
        assert.equal(res.status, 400);
        assert.equal(res.json.success, false);
    });

    test("5. POST /api/complaints rejects missing required fields (description missing)", async () => {
        const res = await makeRequest({
            path: "/api/complaints",
            method: "POST",
            body: {
                title: "Valid title but missing description",
                location: "Main Street"
            }
        });
        assert.equal(res.status, 400);
        assert.equal(res.json.success, false);
        assert.match(res.json.message, /Description is required/i);
    });

    test("6. POST /api/complaints successfully creates a complaint and returns JS-2026-XXXX tracking ID", async () => {
        const payload = {
            title: "Dangerous Pothole on Sector 17 Main Road",
            description: "Deep pothole causing risk of two-wheeler accidents and heavy traffic congestion.",
            location: "Sector 17, Near City Park, Bhopal, MP",
            category: "Roads & Infrastructure",
            department: "Public Works (PWD)"
        };

        const res = await makeRequest({
            path: "/api/complaints",
            method: "POST",
            headers: {
                "Origin": "https://getitresolved1-sus2.vercel.app"
            },
            body: payload
        });

        assert.equal(res.status, 201);
        assert.equal(res.json.success, true);
        assert.ok(res.json.tracking_id, "tracking_id must be present");
        assert.match(res.json.tracking_id, /^JS-2026-\d{4}$/, "tracking_id must match format JS-2026-XXXX");
        assert.equal(res.json.complaint.title, payload.title);
        assert.equal(res.json.complaint.location, payload.location);

        createdTrackingId = res.json.tracking_id;
    });

    test("7. GET /api/complaints/:trackingId retrieves single complaint by tracking ID", async () => {
        assert.ok(createdTrackingId, "Tracking ID must be defined from previous test");
        const res = await makeRequest({
            path: `/api/complaints/${createdTrackingId}`
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, true);
        assert.equal(res.json.complaint.tracking_id, createdTrackingId);
    });

    test("8. GET /api/complaints/:trackingId rejects malformed tracking ID with 400 Bad Request", async () => {
        const res = await makeRequest({
            path: "/api/complaints/INVALID-ID-123"
        });

        assert.equal(res.status, 400);
        assert.equal(res.json.success, false);
        assert.match(res.json.message, /Invalid tracking ID format/i);
    });

    test("9. POST /api/complaints/:trackingId/upvote increments upvotes atomically", async () => {
        assert.ok(createdTrackingId, "Tracking ID must be defined");
        const res = await makeRequest({
            path: `/api/complaints/${createdTrackingId}/upvote`,
            method: "POST"
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, true);
        assert.equal(res.json.upvotes, 1);
    });

    test("10. GET /api/complaints queries complaints list with pagination & count", async () => {
        const res = await makeRequest({
            path: "/api/complaints?page=1&limit=10"
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, true);
        assert.ok(Array.isArray(res.json.complaints));
        assert.ok(typeof res.json.totalRecords === "number");
    });

    test("11. POST /api/feedback submits citizen feedback with contact & message", async () => {
        const res = await makeRequest({
            path: "/api/feedback",
            method: "POST",
            body: {
                name: "Citizen Tanmay",
                contact: "tanmay@example.com",
                type: "Appreciation",
                message: "Excellent prompt resolution of civic grievances."
            }
        });

        assert.equal(res.status, 201);
        assert.equal(res.json.success, true);
        assert.ok(res.json.feedbackId.startsWith("FB-"));
    });

    test("12. GET undefined route returns standardized 404 JSON", async () => {
        const res = await makeRequest({
            path: "/api/nonexistent-route-endpoint"
        });

        assert.equal(res.status, 404);
        assert.equal(res.json.success, false);
        assert.match(res.json.message, /Route not found/i);
    });
});
