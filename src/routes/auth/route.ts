import { Hono } from "hono";
import bcrypt from "bcrypt";
import { connectDB } from "@/Utility/db";
import { User } from "@/models/User";

const auth = new Hono()
    .post("/sign-in", async (c) => {
        await connectDB();
        const { email, password } = await c.req.json();
        const user = await User.findOne({ email });
        if (!user || !user.password) return c.json({ error: "Invalid credentials" }, 400);
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return c.json({ error: "Invalid credentials" }, 400);
        return c.json({ message: "Login successful" });
    })
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
        await newUser.save();
        return c.json({ message: "User created successfully" });
    });
export default auth;