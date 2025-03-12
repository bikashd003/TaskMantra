import { User } from "@/models/User";
import { uploadToCloudinary } from "@/Utility/cloudinary";
import { connectDB } from "@/Utility/db";
// import { Settings } from "@/models/Settings"

const updateProfileSetting=async (userId:string,data:any) => {
    try {
        await connectDB();
        const user=await User.findByIdAndUpdate(userId,data);
        if (!user) {
            throw new Error("User not found") 
        }
        const userData = {
            username: user.name,
            email: user.email,
            image: user.image,
            bio: user.bio,
            urls: user.urls
        }
        return userData;
    } catch (error:any) {
        return error;
    }
}

const getProfileSetting=async (userId:string) => {
    try {
        await connectDB();
        const user=await User.findById(userId);
        if (!user) {
            throw new Error("User not found") 
        }
        const profileData={
            username:user.name,
            email:user.email,
            image:user.image,
            bio:user.bio,
            urls:user.urls
        }
        return profileData;
    } catch (error:any) {
        return error;
    }
}

const updateProfileImage = async (userId: string, data) => {
    try {
        await connectDB();
        const { secure_url } = await uploadToCloudinary(data.file);
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: { image: secure_url },
            },
            { new: true }
        );
        if (!user) {
            throw new Error("User not found");
        }
        const profileData = {
            username: user.name,
            email: user.email,
            image: user.image,
            bio: user.bio,
            urls: user.urls
        }
        return profileData
    } catch (error: any) {
        return error;
    }
}

export { updateProfileSetting, getProfileSetting, updateProfileImage }