import { Settings, Notifications, General } from "@/models/Settings";
import { connectDB } from "@/Utility/db";
import mongoose from "mongoose";

const notificationsSettings = async (userId: string) => {
    try {
        await connectDB();
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const userSettings = await Settings.findOne({ userId: userObjectId })
            .populate('notificationSettings');
        
        if (!userSettings) {
            const newNotifications = new Notifications({
                email: {
                    taskAssigned: true,
                    taskUpdates: true,
                    taskComments: false,
                    dueDateReminders: true,
                    teamUpdates: true,
                },
                push: {
                    instantNotifications: true,
                    mentions: true,
                    teamActivity: false,
                },
                desktop: {
                    showNotifications: true,
                    soundEnabled: true,
                }
            });
            await newNotifications.save();
            
            const newGeneral = new General({}); 
            await newGeneral.save();
            
            const newSettings = new Settings({
                userId: userObjectId,
                notificationSettings: newNotifications._id,
                generalSettings: newGeneral._id
            });
            await newSettings.save();
            
            return newNotifications;
        }
        
        return userSettings.notificationSettings;
    }
    catch (error: any) {
        return error;
    }
}

const updateNotificationsSettings = async (userId: string, data: any) => {
    try {
        await connectDB();
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const userSettings = await Settings.findOne({ userId: userObjectId });
        
        if (!userSettings) {
            const newNotifications = new Notifications({
                email: data.email || {},
                push: data.push || {},
                desktop: data.desktop || {}
            });
            await newNotifications.save();
            
            const newGeneral = new General({});
            await newGeneral.save();
            
            const newSettings = new Settings({
                userId: userObjectId,
                notificationSettings: newNotifications._id,
                generalSettings: newGeneral._id
            });
            await newSettings.save();
            
            return newNotifications;
        } else {
            const updatedNotifications = await Notifications.findByIdAndUpdate(
                userSettings.notificationSettings,
                {
                    $set: {
                        ...(data.email && { 'email': data.email }),
                        ...(data.push && { 'push': data.push }),
                        ...(data.desktop && { 'desktop': data.desktop })
                    }
                },
                { new: true }
            );
            
            return updatedNotifications;
        }
    } catch (error: any) {
        return error;
    }
}

export {
    notificationsSettings,
    updateNotificationsSettings
}