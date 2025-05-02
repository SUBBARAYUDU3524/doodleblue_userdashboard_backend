const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create a new user
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors specifically
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).send({ error: errors.join(", ") });
    }
    res.status(500).send({ error: "Server error" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Get a single with id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Update a user
router.patch("/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["firstName", "lastName", "email", "age", "isActive"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    // First find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Apply updates
    updates.forEach((update) => (user[update] = req.body[update]));

    // Save the document (which will trigger validators)
    await user.save();

    res.send(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).send({ error: errors.join(", ") });
    }
    res.status(400).send({ error: error.message });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
