import User from "../models/User.mjs";
import { sendCustomBirthdayEmail } from "../services/emailService.mjs";

// Render send email form
export const renderSendEmailForm = async (req, res) => {
  try {
    const users = await User.find().sort({ username: 1 });
    const selectedUserId = req.params.userId || null;

    res.render("emails/send", {
      users,
      selectedUserId,
      title: "Send Birthday Email",
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/users");
  }
};

// Send a custom birthday email
export const sendCustomEmail = async (req, res) => {
  try {
    const { userId, subject, templateType, customMessage } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/emails/send");
    }

    // Send the email with custom options
    const emailResult = await sendCustomBirthdayEmail(user, {
      subject,
      templateType,
      customMessage,
    });

    req.flash(
      "success",
      `Birthday email sent to ${user.username} successfully!`
    );
    res.redirect("/users");
  } catch (error) {
    req.flash("error", `Failed to send email: ${error.message}`);
    res.redirect("/emails/send");
  }
};

// Send birthday emails to all users celebrating today
export const sendAllBirthdayEmails = async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Find all users with birthdays today
    const birthdayUsers = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    });

    if (birthdayUsers.length === 0) {
      req.flash("error", "No users have birthdays today");
      return res.redirect("/birthdays");
    }

    // Send emails to all birthday users
    const results = [];
    for (const user of birthdayUsers) {
      try {
        await sendCustomBirthdayEmail(user, {
          subject: "Happy Birthday!",
          templateType: "default",
          customMessage: "Wishing you a fantastic birthday celebration!",
        });
        results.push({
          userId: user._id,
          username: user.username,
          status: "success",
        });
      } catch (error) {
        results.push({
          userId: user._id,
          username: user.username,
          status: "failed",
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    req.flash("success", `Successfully sent ${successCount} birthday emails!`);
    res.redirect("/birthdays");
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/birthdays");
  }
};
