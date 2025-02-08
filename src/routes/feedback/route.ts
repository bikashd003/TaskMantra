import { Hono } from "hono";
import { connectDB } from "@/Utility/db";
import Feedback from "@/models/Feedback";
import { uploadToCloudinary } from "@/Utility/cloudinary";

const feedback = new Hono()
    .post("/feedback", async (c) => {
        try {
            await connectDB();
            
            const { comment, feedbackType, screenshot,userId } = await c.req.json();
            let screenshotUrl = "";
            if (screenshot) {
                const uploadResult = await uploadToCloudinary(screenshot);
                screenshotUrl = uploadResult.secure_url;
            }

            const newFeedback = new Feedback({
                userId: userId,
                description: comment,
                feedbackType,
                screenshot: screenshotUrl,
            });
            
            await newFeedback.save();
            return c.json({ message: "Feedback submitted successfully" });
        } catch (error:any) {
            return c.json({ error: error.message }, 500);
        }
    });

export default feedback;