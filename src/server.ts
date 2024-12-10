import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import router from "./routes/form.routes.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
