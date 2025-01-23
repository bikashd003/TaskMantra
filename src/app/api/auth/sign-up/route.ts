import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import auth from "@/routes/auth/route";

const app = new Hono().basePath("/api");

app.use("*", logger());

const routes = app
    .route("/auth", auth)

export const POST = handle(routes)