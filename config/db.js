import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql2.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the database.");
});

export default db;
