import { Request, Response } from "express";
import prisma from "../model/prismaClient.js";

export const getFormStats = async (req: Request, res: Response) => {
  const { userId } = req.query as { userId: string };

  try {
    const stats = await prisma.form.aggregate({
      where: { userId },
      _sum: { visits: true, submissions: true },
    });

    const visits = stats._sum.visits || 0;
    const submissions = stats._sum.submissions || 0;
    const submissionsRate = visits > 0 ? (submissions / visits) * 100 : 0;
    const bounceRate = 100 - submissionsRate;

    res.json({ visits, submissions, submissionsRate, bounceRate });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const createForm = async (req: Request, res: Response) => {
  const { userId, name, description } = req.body;

  try {
    const form = await prisma.form.create({
      data: { userId, name, description },
    });
    res.json({ formId: form.id });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getForms = async (req: Request, res: Response) => {
  const { userId } = req.query as { userId: string };

  try {
    const forms = await prisma.form.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getFormById = async (req: Request, res: Response) => {
  const { userId } = req.query as { userId: string };
  const { id } = req.params;

  try {
    const form = await prisma.form.findUnique({
      where: { userId, id },
    });
    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const updateFormContent = async (req: Request, res: Response) => {
  const { userId, content } = req.body;
  const { id } = req.params;

  try {
    const updatedForm = await prisma.form.update({
      where: { userId, id },
      data: { content },
    });
    res.json(updatedForm);
  } catch (error) {
    console.error("Error updating form content:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const publishForm = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const publishedForm = await prisma.form.update({
      where: { userId, id },
      data: { published: true },
    });
    res.json(publishedForm);
  } catch (error) {
    console.error("Error publishing form:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getFormContent = async (req: Request, res: Response) => {
  const { shareUrl } = req.body;

  if (!shareUrl) {
    res.status(400).json({ error: "shareUrl is required" });
    return;
  }

  try {
    const form = await prisma.form.update({
      where: { shareUrl },
      data: { visits: { increment: 1 } },
      select: { content: true },
    });

    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }
    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  const { formUrl, content } = req.body;

  try {
    const form = await prisma.form.update({
      where: { shareUrl: formUrl, published: true },
      data: {
        submissions: { increment: 1 },
        FormSubmissions: { create: { content } },
      },
    });
    res.json(form);
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getFormSubmissions = async (req: Request, res: Response) => {
  const { userId } = req.query as { userId: string };
  const { id } = req.params;

  try {
    const form = await prisma.form.findUnique({
      where: { userId, id },
      include: { FormSubmissions: true },
    });
    res.json(form);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const deleteForm = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const deletedForm = await prisma.form.delete({
      where: { userId, id },
    });
    res.json(deletedForm);
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const deleteFormElement = async (req: Request, res: Response) => {
  const { userId, elementId } = req.body;
  const { id } = req.params;
  try {
    const form = await prisma.form.findUnique({
      where: { userId, id: id },
      select: { content: true },
    });

    if (!form) {
      res.status(404).send("Form not found");
      return;
    }

    const content = JSON.parse(form.content || "[]");
    const newContent = content.filter(
      (element: { id: string }) => element.id !== elementId
    );

    const updatedForm = await prisma.form.update({
      where: { userId, id },
      data: { content: JSON.stringify(newContent) },
    });

    res.json(updatedForm);
  } catch (error) {
    console.error("Error deleting form element:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
