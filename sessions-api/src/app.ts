import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import restRouter from "./api/rest";

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/sessions", restRouter);

  // mariadb -> port 3307

  // using obscure port to avoid conflicts
  const port = process.env.PORT || 6023;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exitCode = 1;
});