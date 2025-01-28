import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add MONGODB_URI to .env file');
}

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};