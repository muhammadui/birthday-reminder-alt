import express from "express";
import {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getTodaysBirthdays,
  testBirthdayEmail,
  simulateTodaysBirthdays,
} from "../controllers/userController.mjs";

const router = express.Router();

// Set up routes
router.route("/").post(addUser).get(getUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.get("/birthdays/today", getTodaysBirthdays);

// Test endpoints
router.post("/test/email/:userId", testBirthdayEmail);
router.post("/test/simulate-today", simulateTodaysBirthdays);

export default router;
