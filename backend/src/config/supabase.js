
const path = require("path");
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
    require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
}

const supabaseJs = require("@supabase/supabase-js");
const createClient = supabaseJs.createClient || (supabaseJs.default && supabaseJs.default.createClient);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase credentials are missing from .env");
}

const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey
);

module.exports = supabase;
module.exports.supabase = supabase;
module.exports.default = supabase;

