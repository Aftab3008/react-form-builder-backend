import express from "express";
import {
  createForm,
  deleteForm,
  deleteFormElement,
  getFormById,
  getFormContent,
  getForms,
  getFormStats,
  getFormSubmissions,
  publishForm,
  submitForm,
  updateFormContent,
} from "../controller/form.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/forms/stats", verifyToken, getFormStats);
router.post("/forms/create", verifyToken, createForm);
router.get("/forms", verifyToken, getForms);
router.get("/forms/:id", verifyToken, getFormById);
router.put("/forms/:id/content", verifyToken, updateFormContent);
router.put("/forms/:id/publish", verifyToken, publishForm);
router.post("/forms/content", verifyToken, getFormContent);
router.post("/forms/submit", verifyToken, submitForm);
router.get("/forms/:id/submissions", verifyToken, getFormSubmissions);
router.delete("/forms/:id", verifyToken, deleteForm);
router.put("/forms/:id/delete-elemnent", verifyToken, deleteFormElement);

export default router;
