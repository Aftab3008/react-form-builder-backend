import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/form.routes.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", router);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
