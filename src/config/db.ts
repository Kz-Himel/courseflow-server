import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const db = client.db(process.env.DATABASE_NAME!);

export async function connectDB() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });

  console.log("MongoDB Connected Successfully");
}