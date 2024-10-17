import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import { neon } from "@neondatabase/serverless";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("This is da backend");
});

export const sql = neon(process.env.DATABASE_URL);

async function getPgVersion() {
  const result = await sql`SELECT version()`;
  console.log(result[0]);
}

getPgVersion();

app.listen(port, () => {
  console.log(`SERVER IS ALIVE ON PORT ${port}`);
});

export default app;
