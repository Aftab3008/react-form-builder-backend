import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import router from "./routes/form.routes.js";
const app = express();
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
console.log(corsOptions);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);
app.use("/auth", authRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
