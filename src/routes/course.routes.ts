import { Router } from "express";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const course = {
      ...req.body,
      creatorEmail: req.user?.email,
      creatorId: req.user?.sub,
      createdAt: new Date(),
    };

    const result = await db.collection("courses").insertOne(course);

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add course",
    });
  }
});

export default router;