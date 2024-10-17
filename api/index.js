import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("This is da backend");
});

app.listen(port, () => {
  console.log(`SERVER IS ALIVE ON PORT ${port}`);
});

module.exports = app;
