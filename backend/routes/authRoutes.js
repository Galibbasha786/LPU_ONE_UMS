// backend/routes/authRoutes.js
import express from "express";
import { login, createAdmin, createStaff, createStudent } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin", createAdmin);
router.post("/staff", createStaff);
router.post("/student", createStudent);

export default router;