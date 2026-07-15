import dotenv from "dotenv";
dotenv.config();
import serverless from "serverless-http";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
let initialized = false;
const handler = serverless(app);
export default async function (req, res) {
    if (!initialized) {
        await connectDB();
        initialized = true;
    }
    return handler(req, res);
}
