import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if today is user's birthday
userSchema.methods.isBirthdayToday = function () {
  const today = new Date();
  const dob = this.dateOfBirth;

  return (
    today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth()
  );
};

const User = mongoose.model("User", userSchema);

export default User;
