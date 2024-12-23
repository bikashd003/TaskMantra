import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.get("/auth/sign-in", (c) => {
    return c.text("Hello World");
});



export const GET = handle(app);
