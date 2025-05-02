const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxlength: [50, "First name cannot exceed 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxlength: [50, "Last name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  age: {
    type: Number,
    min: [18, "Minimum age is 18"],
    max: [100, "Maximum age is 120"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

userSchema.path("email").validate(async function (email) {
  if (this.isModified("email") === false) return true;

  try {
    const count = await mongoose.models.User.countDocuments({
      email,
    }).maxTimeMS(30000);
    return count === 0;
  } catch (err) {
    console.error("Validation error:", err);
    return false;
  }
}, "Email already exists");

const User = mongoose.model("User", userSchema);

module.exports = User;
