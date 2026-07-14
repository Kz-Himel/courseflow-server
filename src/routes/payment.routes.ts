import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Stripe from "stripe";

const router = express.Router();

const coursesCollection = db.collection("courses");
const paymentsCollection = db.collection("payments");
const myCoursesCollection = db.collection("myCourses");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// STEP 1: Payment initiate
router.post("/initiate", verifyToken, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userEmail = (req as any).user?.email;

    if (!ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const alreadyEnrolled = await myCoursesCollection.findOne({
      userEmail,
      courseId: new ObjectId(courseId),
    });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    const transactionId = "TXN" + Date.now();

    const paymentDoc = {
      userEmail,
      courseId: new ObjectId(courseId),
      amount: course.price,
      status: "pending",
      transactionId,
      createdAt: new Date(),
    };

    await paymentsCollection.insertOne(paymentDoc);

    res.status(201).json({
      success: true,
      transactionId,
      amount: course.price,
      courseTitle: course.title,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// STEP 2: Payment confirm
router.post("/confirm", verifyToken, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;
    const userEmail = (req as any).user?.email;

    const payment = await paymentsCollection.findOne({ transactionId, userEmail });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    if (payment.status === "completed") {
      return res.status(400).json({ success: false, message: "Payment already completed" });
    }

    // jodi stripe payment intent thake, verify koro Stripe theke
    if (payment.stripePaymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      if (intent.status !== "succeeded") {
        return res.status(400).json({ success: false, message: "Payment not completed yet" });
      }
    }

    await paymentsCollection.updateOne(
      { transactionId },
      { $set: { status: "completed" } }
    );

    await myCoursesCollection.insertOne({
      userEmail,
      courseId: payment.courseId,
      paymentId: payment._id,
      enrolledAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Payment successful", transactionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// STEP 3: Get single payment (success page e course info dekhanor jonno)
router.get("/:transactionId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const userEmail = (req as any).user?.email;

    const payment = await paymentsCollection.findOne({ transactionId, userEmail });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const course = await coursesCollection.findOne({ _id: payment.courseId });

    res.status(200).json({
      success: true,
      payment: {
        ...payment,
        course,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});


// Payment intent
router.post("/create-payment-intent", verifyToken, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userEmail = (req as any).user?.email;

    if (!ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const alreadyEnrolled = await myCoursesCollection.findOne({
      userEmail,
      courseId: new ObjectId(courseId),
    });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    // Stripe amount cents e lage (100 = $1)
    const amountInCents = Math.round(course.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        courseId: courseId,
        userEmail: userEmail,
      },
    });

    const transactionId = "TXN" + Date.now();

    await paymentsCollection.insertOne({
      userEmail,
      courseId: new ObjectId(courseId),
      amount: course.price,
      status: "pending",
      transactionId,
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      transactionId,
      amount: course.price,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

export default router;