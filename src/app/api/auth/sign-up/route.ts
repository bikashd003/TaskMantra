import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import bcrypt from "bcrypt";
import { connectDB } from "@/Utility/db";
import { User } from "@/models/User";

const app = new Hono().basePath("/api/auth");

app.use("*", logger());
const signup = async (c: any) => {
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
};
app.post("/sign-up", signup);

export const POST = handle(app)