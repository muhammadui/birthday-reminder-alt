import User from "../models/User.mjs";

// Add a new user with birthday info
export const addUser = async (req, res) => {
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
};

// Get all users
export const getUsers = async (req, res) => {
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
};

// Get a single user
export const getUser = async (req, res) => {
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
};

// Update user information
export const updateUser = async (req, res) => {
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
};

// Delete user
export const deleteUser = async (req, res) => {
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
};

//

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

    // Import the email service
    const { sendBirthdayEmail } = await import("../services/emailService.mjs");

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

    // Import the email service
    const { sendBirthdayEmail } = await import("../services/emailService.mjs");

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

// Add this to routes/userRoutes.mjs

// Add the following to the .env file
/*
PORT=5000
MONGO_URI=mongodb://localhost:27017/birthday-reminder
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=birthday@yourbusiness.com

*/
