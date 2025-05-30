import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { connectDB } from "@/Utility/db";
import { User } from "@/models/User";

const auth = new Hono()
    .post("/sign-up", async (c) => {
        await connectDB();
        const { name, email, password } = await c.req.json();
        const user = await User.findOne({ email });
        if (user) {
            return c.json({ error: "User already exists" }, 400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        const createdUser = await newUser.save();
        return c.json({ message: "User created successfully", user: createdUser }, 201);
    });
export default auth;