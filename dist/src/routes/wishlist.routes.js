import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = Router();
// GET: Users wishlist items API
router.get("/", verifyToken, async (req, res) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized! User email not found.",
            });
        }
        // MongoDB Aggregate Pipeline 
        const wishlistWithDetails = await db
            .collection("wishlists")
            .aggregate([
            // 1. Filter users wishlist
            { $match: { userEmail: userEmail } },
            // 2. Find users wishlist id and course id
            {
                $lookup: {
                    from: "courses",
                    let: { searchId: "$courseId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$searchId"] },
                                        { $eq: [{ $toString: "$_id" }, "$$searchId"] } // String/ObjectId mismatch
                                    ]
                                }
                            }
                        }
                    ],
                    as: "course"
                }
            },
            // 3. 'course' convert array to object
            { $unwind: "$course" },
            // 4. add to top the new course
            { $sort: { addedAt: -1 } }
        ])
            .toArray();
        return res.status(200).json({
            success: true,
            count: wishlistWithDetails.length,
            data: wishlistWithDetails,
        });
    }
    catch (error) {
        console.error("Backend Wishlist GET Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching wishlist.",
        });
    }
});
// POST: Add to wishlist API
router.post("/", verifyToken, async (req, res) => {
    try {
        const { courseId } = req.body;
        // 1. Structural safety guard: Prevent ObjectId casting crash
        if (!courseId || !ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing Course ID format",
            });
        }
        // Now it is safe to query
        const course = await db.collection("courses").findOne({
            _id: new ObjectId(courseId),
        });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        const exists = await db.collection("wishlists").findOne({
            userEmail: req.user?.email,
            courseId, // Note: verify if your wishlist saves this as a string or ObjectId!
        });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Already added to wishlist",
            });
        }
        const result = await db.collection("wishlists").insertOne({
            userEmail: req.user?.email,
            courseId,
            addedAt: new Date(),
        });
        return res.status(201).json({
            success: true,
            message: "Course added to wishlist",
            insertedId: result.insertedId,
        });
    }
    catch (error) {
        console.error("Backend Error:", error);
        // Explicitly guarantee JSON format even on total server failure
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred",
        });
    }
});
// DELETE: Remove course from wishlist
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user?.email;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid wishlist ID",
            });
        }
        const result = await db.collection("wishlists").deleteOne({
            _id: new ObjectId(id),
            userEmail,
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Wishlist item not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Course removed from wishlist successfully",
        });
    }
    catch (error) {
        console.error("Delete Wishlist Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
export default router;
