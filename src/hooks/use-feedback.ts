import { useMutation } from "@tanstack/react-query";
import { uploadToCloudinary } from "@/Utility/cloudinary";
import { toast } from "sonner";

interface FeedbackInput {
  message: string;
  type: string;
  screenshot?: File;
}

async function submitFeedback(data: FeedbackInput) {
  let screenshotUrl = "";
  
  if (data.screenshot) {
    const uploadResult = await uploadToCloudinary(data.screenshot, "feedback-screenshots");
    if (uploadResult.error) {
      throw new Error("Failed to upload screenshot");
    }
    screenshotUrl = uploadResult.secure_url;
  }

  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: data.message,
      type: data.type,
      screenshot: screenshotUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit feedback");
  }

  return response.json();
}

export function useFeedback() {
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });
}
