import User from "../models/User.mjs";
import { sendBirthdayEmail } from "../services/emailService.mjs";

// Add a new user with birthday info
export const addUser = async (req, res) => {
  try {
    const { username, email, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User with this email already exists");
      return res.redirect("/users/new");
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      dateOfBirth,
    });

    req.flash("success", `User ${username} added successfully!`);
    res.redirect("/users");
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/users/new");
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ username: 1 });
    res.render("users/index", {
      users,
      title: "All Users",
    });
  } catch (error) {
    req.flash("error", error.message);
    console.log(error);
    res.redirect("/");
  }
};

// Form to create a new user
export const newUserForm = async (req, res) => {
  res.render("users/new", { title: "Add User" });
};

// Get a single user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users");
    }

    res.render("users/show", {
      user,
      title: user.username,
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/users");
  }
};

// Show form to edit user
export const editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users");
    }

    res.render("users/edit", {
      user,
      title: `Edit ${user.username}`,
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/users");
  }
};

// Update user information
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users");
    }

    req.flash("success", `User ${user.username} updated successfully!`);
    res.redirect(`/users/${user._id}`);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect(`/users/${req.params.id}/edit`);
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users");
    }

    req.flash("success", `User ${user.username} deleted successfully!`);
    res.redirect("/users");
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/users");
  }
};

// Get users with birthday today
export const getTodaysBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const day = today.getDate();

    // Find users whose birthday is today
    const users = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    }).sort({ username: 1 });

    res.render("birthdays/index", {
      users,
      title: "Today's Birthdays",
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/");
  }
};

// Test endpoint to manually trigger birthday emails
export const testBirthdayEmail = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send test birthday email
    const emailResult = await sendBirthdayEmail(user);

    res.status(200).json({
      success: true,
      message: `Test birthday email sent to ${user.username} (${user.email})`,
      emailResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Test endpoint to simulate today's birthdays
export const simulateTodaysBirthdays = async (req, res) => {
  try {
    // Get users regardless of birthday date
    const users = await User.find().limit(5); // Limit to 5 users for safety

    // Send emails to selected users
    const results = [];
    for (const user of users) {
      try {
        const emailResult = await sendBirthdayEmail(user);
        results.push({
          userId: user._id,
          username: user.username,
          email: user.email,
          status: "success",
          emailId: emailResult.id,
        });
      } catch (error) {
        results.push({
          userId: user._id,
          username: user.username,
          email: user.email,
          status: "failed",
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Simulated birthday emails for ${results.length} users`,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Optional: Add a function to manually trigger the birthday check
export const triggerBirthdayCheck = async () => {
  console.log(
    `Manually triggering birthday check at ${new Date().toISOString()}`
  );

  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Find all users whose birthday is today
    const birthdayUsers = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    });

    console.log(`Found ${birthdayUsers.length} birthdays today.`);

    // Send birthday emails to each user
    const results = [];
    for (const user of birthdayUsers) {
      try {
        await sendBirthdayEmail(user);
        results.push({
          userId: user._id,
          username: user.username,
          email: user.email,
          status: "success",
        });
      } catch (error) {
        results.push({
          userId: user._id,
          username: user.username,
          email: user.email,
          status: "failed",
          error: error.message,
        });
      }
    }

    return {
      success: true,
      count: birthdayUsers.length,
      results,
    };
  } catch (error) {
    console.error(`Manual birthday check error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Render the homepage
export const renderHomePage = async (req, res) => {
  res.render("index", { title: "Home" });
};
