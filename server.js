import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import session from "express-session";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true, sameSite: "strict" },
  })
);
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("This is da backend");
});

app.listen(port, () => {
  console.log(`SERVER IS ALIVE ON PORT ${port}`);
});
