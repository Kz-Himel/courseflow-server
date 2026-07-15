import { Router } from "express";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { ObjectId } from "mongodb";

const router = Router();

// GET: All Course API
// GET: All Course API (with search, filter, sort, pagination)
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      level = "",
      maxPrice,
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;

    const filter: any = {};

    // Search (title / instructorName / shortDescription e case-insensitive match)
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { instructorName: regex },
        { shortDescription: regex },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Level filter
    if (level) {
      filter.level = level;
    }

    // Max price filter
    if (maxPrice !== undefined && maxPrice !== "") {
      filter.price = { $lte: Number(maxPrice) };
    }

    // Sort mapping
    let sortQuery: any = { createdAt: -1 }; // default: newest
    if (sort === "price_asc") sortQuery = { price: 1 };
    else if (sort === "price_desc") sortQuery = { price: -1 };
    else if (sort === "rating") sortQuery = { rating: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const collection = db.collection("courses");

    const [courses, total] = await Promise.all([
      collection.find(filter).sort(sortQuery).skip(skip).limit(limitNum).toArray(),
      collection.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
});

// GET: Featured Courses (rating high thakle age dekhabe, na thakle latest 8ta)
router.get("/featured", async (_req, res) => {
  try {
    const featuredCourses = await db
      .collection("courses")
      .find()
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .toArray();

    res.status(200).json({
      success: true,
      data: featuredCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured courses",
    });
  }
});

// GET: My Listings — logged in user (creator) er add kora course gula
router.get("/my-listings", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    console.log("Current user email:", userEmail);

    const allCourses = await db.collection("courses").find().toArray();
    // console.log("All courses creatorEmail values:", allCourses.map(c => c.creatorEmail));

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
router.get("/:id", async (req, res) => {
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

// PATCH: Update own course
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id as string;
    const userEmail = req.user?.email;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(id),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.creatorEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // creatorEmail, creatorId, createdAt kokhono body theke overwrite hote parbe na
    const { creatorEmail, creatorId, createdAt, _id, ...updateData } = req.body;

    await db.collection("courses").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
});

// DELETE: Remove own course
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id as string;
    const userEmail = req.user?.email;

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(id),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.creatorEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    await db.collection("courses").deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
});

export default router;