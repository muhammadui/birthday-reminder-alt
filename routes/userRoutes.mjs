import express from "express";
import methodOverride from "method-override";
import {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getTodaysBirthdays,
  testBirthdayEmail,
  simulateTodaysBirthdays,
  newUserForm,
  editUserForm,
  renderHomePage,
} from "../controllers/userController.mjs";

import {
  renderSendEmailForm,
  sendCustomEmail,
  sendAllBirthdayEmails,
} from "../controllers/emailController.mjs";

const router = express.Router();

// Add middleware to support PUT/DELETE methods from forms
router.use(methodOverride("_method"));

// Home page
router.get("/", renderHomePage);

// User web routes
router.get("/users", getUsers);
router.get("/users/new", newUserForm);
router.post("/users", addUser);
router.get("/users/:id", getUser);
router.get("/users/:id/edit", editUserForm);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Birthday web routes
router.get("/birthdays", getTodaysBirthdays);

// Email web routes
router.get("/emails/send", renderSendEmailForm);
router.get("/emails/send/:userId", renderSendEmailForm);
router.post("/emails/send", sendCustomEmail);
router.get("/emails/send-all-birthday", sendAllBirthdayEmails);

// API routes
router.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/api/users", async (req, res) => {
  try {
    const { username, email, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      dateOfBirth,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/api/birthdays/today", async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Find users whose birthday is today
    const users = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/api/emails/send", async (req, res) => {
  try {
    const { userId, subject, templateType, customMessage } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send the email with custom options
    const emailResult = await sendCustomBirthdayEmail(user, {
      subject,
      templateType,
      customMessage,
    });

    res.status(200).json({
      success: true,
      message: `Birthday email sent to ${user.username} successfully!`,
      data: {
        emailId: emailResult.id,
        recipient: user.email,
        subject,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Test endpoints
router.post("/api/test/email/:userId", testBirthdayEmail);
router.post("/api/test/simulate-today", simulateTodaysBirthdays);

export default router;
