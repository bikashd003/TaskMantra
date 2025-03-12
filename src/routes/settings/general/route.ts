import { Settings } from "@/models/Settings";
import { connectDB } from "@/Utility/db";

const getGeneralSettings = async (userId: string) => {
  try {
    await connectDB();
    const userSettings=await Settings.findOne({userId:userId})
    return userSettings;
  } catch (error: any) {
    return error;
  }
};
const updateGeneralSettins = async (userId: string, data: any) => {
  try {
    await connectDB();
    const userSettings=await Settings.findOne({userId:userId})
    if(!userSettings){
        // TODO: Create a new settings document
        const newSettings=new Settings({
            userId:userId,
            ...data
        })
        await newSettings.save();
        return newSettings;
    }else{
       const updatedSettings= await Settings.findOneAndUpdate({userId:userId},{
            $set:{
                ...data
            }
        },{new:true})
        return updatedSettings;
    }
  } catch (error: any) {
    return error;
  }
};
export { getGeneralSettings, updateGeneralSettins };