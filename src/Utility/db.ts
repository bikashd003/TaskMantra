import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add MONGODB_URI to .env file');
}

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};