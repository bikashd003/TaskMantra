import {Hono} from "hono"
import { handle } from "hono/vercel"
import { logger } from "hono/logger"
import feedback from "@/routes/feedback/route"

const app = new Hono().basePath("/api")

app.use("*", logger())

const routes = app
  .route("/", feedback)

export const GET = handle(routes)
export const POST = handle(routes)
export const DELETE = handle(routes)
export const PUT = handle(routes)