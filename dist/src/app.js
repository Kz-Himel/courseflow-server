import express from "express";
import cors from "cors";
import courseRoutes from "./routes/course.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import myCourseRoutes from "./routes/myCourses.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
    res.send("CourseFlow Server Running...");
});
app.use("/courses", courseRoutes);
app.use("/wishlists", wishlistRoutes);
app.use("/payments", paymentRoutes);
app.use("/my-courses", myCourseRoutes);
export default app;
