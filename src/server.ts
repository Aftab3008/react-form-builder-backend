import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.get("/forms/stats", async (req, res) => {
  const { userId } = req.query as { userId: string };

  const stats = await prisma.form.aggregate({
    where: { userId },
    _sum: { visits: true, submissions: true },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;
  const submissionsRate = visits > 0 ? (submissions / visits) * 100 : 0;
  const bounceRate = 100 - submissionsRate;

  res.json({ visits, submissions, submissionsRate, bounceRate });
});

app.post("/forms/create", async (req, res) => {
  const { userId, name, description } = req.body;
  const form = await prisma.form.create({
    data: { userId, name, description },
  });
  res.json({ formId: form.id });
});

app.get("/forms", async (req, res) => {
  const { userId } = req.query as { userId: string };
  const forms = await prisma.form.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(forms);
});

app.get("/forms/:id", async (req, res) => {
  const { userId } = req.query as { userId: string };
  const { id } = req.params as { id: string };
  const form = await prisma.form.findUnique({
    where: { userId, id },
  });
  res.json(form);
});

app.put("/forms/:id/content", async (req, res) => {
  const { userId, content } = req.body;
  const { id } = req.params;
  const updatedForm = await prisma.form.update({
    where: { userId, id },
    data: { content },
  });
  res.json(updatedForm);
});

app.put("/forms/:id/publish", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  const publishedForm = await prisma.form.update({
    where: { userId, id },
    data: { published: true },
  });
  res.json(publishedForm);
});

app.post(
  "/forms/content",
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

app.post("/forms/submit", async (req, res) => {
  const { formUrl, content } = req.body;
  const form = await prisma.form.update({
    where: { shareUrl: formUrl, published: true },
    data: {
      submissions: { increment: 1 },
      FormSubmissions: { create: { content } },
    },
  });
  res.json(form);
});

app.get("/forms/:id/submissions", async (req, res) => {
  const { userId } = req.query as { userId: string };
  const { id } = req.params;
  const form = await prisma.form.findUnique({
    where: { userId, id },
    include: { FormSubmissions: true },
  });
  res.json(form);
});

app.delete("/forms/:id", async (req, res) => {
  const { userId } = req.query as { userId: string };
  const { id } = req.params;
  const deletedForm = await prisma.form.delete({
    where: { userId, id },
  });
  res.json(deletedForm);
});

app.put(
  "/forms/:id/delete-element",
  async (req: Request, res: Response): Promise<void> => {
    const { userId, elementId } = req.body;
    const { id } = req.params;

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
  }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
