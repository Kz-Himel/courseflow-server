import { Router } from "express";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { ObjectId } from "mongodb";

const router = Router();

// GET: All Course API
router.get("/", async (_req, res) => {
  try {
    const courses = await db
      .collection("courses")
      .find()
      .toArray();

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
});

// GET: My Listings — logged in user (creator) er add kora course gula
router.get("/my-listings", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    console.log("Current user email:", userEmail);

    const allCourses = await db.collection("courses").find().toArray();
    console.log("All courses creatorEmail values:", allCourses.map(c => c.creatorEmail));

    const myCourses = await db
      .collection("courses")
      .find({ creatorEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: myCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch your courses" });
  }
});


// GET: Single Course
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(id),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
});

// POST: Add Course API
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