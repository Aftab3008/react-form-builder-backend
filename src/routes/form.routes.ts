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

const router = express.Router();

router.get("/forms/stats", getFormStats);
router.post("/forms/create", createForm);
router.get("/forms", getForms);
router.get("/forms/:id", getFormById);
router.put("/forms/:id/content", updateFormContent);
router.put("forms/:id/publish", publishForm);
router.post("/forms/content", getFormContent);
router.post("forms/submit", submitForm);
router.get("/forms/:id/submissions", getFormSubmissions);
router.delete("/forms/:id", deleteForm);
router.put("/forms/:id/delete-elemnent", deleteFormElement);

export default router;
