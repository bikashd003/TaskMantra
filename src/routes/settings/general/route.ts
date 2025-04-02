import { Settings, General, Notifications } from "@/models/Settings";
import { connectDB } from "@/Utility/db";
import mongoose from "mongoose";

const getGeneralSettings = async (userId: string) => {
  try {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find settings and populate the referenced general settings
    const userSettings = await Settings.findOne({ userId: userObjectId })
      .populate('generalSettings');

    if (!userSettings) {
      return null;
    }

    return userSettings.generalSettings;
  } catch (error: any) {
    return error;
  }
};

const updateGeneralSettings = async (userId: string, data: any) => {
  try {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the user's settings
    const userSettings = await Settings.findOne({ userId: userObjectId });

    if (!userSettings) {
      // Create new general settings
      const newGeneral = new General({
        appearance: data.appearance || {},
        localization: data.localization || {},
        accessibility: data.accessibility || {}
      });
      await newGeneral.save();

      // Create new notification settings with defaults
      const newNotifications = new Notifications({});
      await newNotifications.save();

      // Create settings that reference both
      const newSettings = new Settings({
        userId: userObjectId,
        generalSettings: newGeneral._id,
        notificationSettings: newNotifications._id
      });
      await newSettings.save();

      return newGeneral;
    } else {
      // Update the existing general settings
      const updatedGeneral = await General.findByIdAndUpdate(
        userSettings.generalSettings,
        {
          $set: {
            ...(data.appearance && { 'appearance': data.appearance }),
            ...(data.localization && { 'localization': data.localization }),
            ...(data.accessibility && { 'accessibility': data.accessibility })
          }
        },
        { new: true }
      );

      return updatedGeneral;
    }
  } catch (error: any) {
    return error;
  }
};

export { getGeneralSettings, updateGeneralSettings };