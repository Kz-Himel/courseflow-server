import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

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
  } catch (error) {
    console.error("Backend Error:", error);
    // Explicitly guarantee JSON format even on total server failure
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
});

export default router;