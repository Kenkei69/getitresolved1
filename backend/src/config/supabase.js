const path = require("path");
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
    require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
}

const supabaseJs = require("@supabase/supabase-js");
const createClient = supabaseJs.createClient || (supabaseJs.default && supabaseJs.default.createClient);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

let supabase = null;

if (supabaseUrl && supabaseSecretKey && typeof createClient === "function") {
    try {
        supabase = createClient(supabaseUrl, supabaseSecretKey);
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e.message);
    }
}

if (!supabase) {
    console.warn("WARNING: SUPABASE_URL or SUPABASE_SECRET_KEY not set. Using resilient in-memory database store.");
    const memoryStore = new Map();
    supabase = {
        from: (table) => ({
            select: (columns = "*", options = {}) => {
                let records = Array.from(memoryStore.values());
                const builder = {
                    data: records,
                    error: null,
                    count: records.length,
                    or: () => builder,
                    ilike: () => builder,
                    eq: (field, val) => {
                        builder.data = builder.data.filter((r) => r[field] === val);
                        return builder;
                    },
                    order: () => builder,
                    range: (from, to) => {
                        builder.data = builder.data.slice(from, to + 1);
                        return builder;
                    },
                    limit: (n) => {
                        builder.data = builder.data.slice(0, n);
                        return builder;
                    },
                    single: async () => ({
                        data: builder.data[0] || null,
                        error: builder.data[0] ? null : { message: "Row not found" }
                    }),
                    then: (resolve) => resolve({
                        data: builder.data,
                        count: builder.data.length,
                        error: null
                    })
                };
                return builder;
            },
            insert: (rows) => {
                const inserted = rows.map((row, i) => {
                    const item = {
                        id: `ticket-${Date.now()}-${i}`,
                        ...row,
                        upvotes: 0,
                        status: "Pending",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    memoryStore.set(item.tracking_id || item.id, item);
                    return item;
                });
                return {
                    select: () => ({
                        single: async () => ({ data: inserted[0], error: null }),
                        then: (resolve) => resolve({ data: inserted, error: null })
                    }),
                    single: async () => ({ data: inserted[0], error: null }),
                    then: (resolve) => resolve({ data: inserted, error: null })
                };
            },
            update: (updates) => ({
                eq: (field, val) => {
                    const existing = Array.from(memoryStore.values()).find((r) => r[field] === val);
                    if (existing) {
                        Object.assign(existing, updates);
                        existing.updated_at = new Date().toISOString();
                    }
                    return {
                        select: () => ({
                            single: async () => ({ data: existing, error: null }),
                            then: (resolve) => resolve({ data: existing ? [existing] : [], error: null })
                        }),
                        single: async () => ({ data: existing, error: null }),
                        then: (resolve) => resolve({ data: existing ? [existing] : [], error: null })
                    };
                }
            })
        })
    };
}

module.exports = supabase;
module.exports.supabase = supabase;
module.exports.default = supabase;
