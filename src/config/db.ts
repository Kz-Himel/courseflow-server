import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const db = client.db(process.env.DATABASE_NAME!);

export async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error);
  }
}