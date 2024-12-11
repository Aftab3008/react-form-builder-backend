import express from "express";
import {
  getUser,
  login,
  logout,
  register,
} from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);
authRouter.get("/getUser", verifyToken, getUser);

export default authRouter;
