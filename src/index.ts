import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("CourseFlow Server Running...");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();