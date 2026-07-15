import express from "express";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();
const myCoursesCollection = db.collection("myCourses");
// GET /my-courses — logged in user er enrolled course gula ana
router.get("/", verifyToken, async (req, res) => {
    try {
        const userEmail = req.user?.email;
        const enrolledCourses = await myCoursesCollection
            .aggregate([
            { $match: { userEmail } },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseId",
                    foreignField: "_id",
                    as: "course",
                },
            },
            { $unwind: "$course" },
            {
                $project: {
                    _id: 1,
                    enrolledAt: 1,
                    course: 1,
                },
            },
            { $sort: { enrolledAt: -1 } },
        ])
            .toArray();
        res.status(200).json({ success: true, courses: enrolledCourses });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});
export default router;
