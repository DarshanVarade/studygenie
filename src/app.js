import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Corrected variable and added a fallback
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// --- Import Routers ---
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import studyMaterialRouter from "./routes/studyMaterial.routes.js";
import generationRouter from "./routes/generation.routes.js";
import progressRouter from "./routes/progress.routes.js";
import tutorRouter from "./routes/tutor.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// --- Router Declarations ---
const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/healthcheck`, healthCheckRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/materials`, studyMaterialRouter);
app.use(`${API_PREFIX}/generate`, generationRouter);
app.use(`${API_PREFIX}/progress`, progressRouter);
app.use(`${API_PREFIX}/tutor`, tutorRouter);

// --- Global Error Handler ---
// This should be the last middleware your app uses
app.use(errorHandler);

export { app };
