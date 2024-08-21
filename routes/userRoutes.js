import express from "express";
import {
  createUser,
  getUserById,
  login,
  logout,
  resetStreakById,
  toggleUserThemeById,
  updateStreakById,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/users", createUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users/:id", getUserById);
router.put("/update/:id", updateStreakById);
router.put("/theme/:id", toggleUserThemeById);
router.put("/reset/:id", resetStreakById);

export default router;
