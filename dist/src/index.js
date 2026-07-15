import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error(err);
    }
}
startServer();
// FOR LOCAL DEVELOPMENT
// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import cors from "cors";
// import { connectDB } from "./config/db.js";
// import courseRoutes from "./routes/course.routes.js";
// import wishlistRoutes from "./routes/wishlist.routes.js";
// import paymentRoutes from "./routes/payment.routes.js";
// import myCourseRoutes from "./routes/myCourses.routes.js";
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.get("/", (_req, res) => {
//   res.send("CourseFlow Server Running...");
// });
// app.use("/courses", courseRoutes);
// app.use("/wishlists", wishlistRoutes);
// app.use("/payments", paymentRoutes);
// app.use("/my-courses", myCourseRoutes);
// const PORT = process.env.PORT || 5000;
// async function startServer() {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//   }
// }
// startServer();
