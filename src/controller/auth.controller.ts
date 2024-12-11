import { Request, Response } from "express";
import prisma from "../model/prismaClient.js";
import bcrypt from "bcryptjs";
import generateTokenAndCookie from "../utils/generateToken.js";
import { RequestWithUserId } from "../middleware/verifyToken.js";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please fill all fields" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateTokenAndCookie(res, user.id, user.email);

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        ...user,
        password: undefined,
      },
      token: token,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ message: "Please fill all fields" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = generateTokenAndCookie(res, newUser.id, newUser.email);

    res.status(201).json({
      message: "User created successfully",
      data: {
        ...newUser,
        password: undefined,
      },
      token: token,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
  return;
};

export const getUser = async (req: RequestWithUserId, res: Response) => {
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      data: {
        ...user,
        password: undefined,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
