const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    nonce: {
      type: String,
      required: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    name: {
      type: String,
      default: "Anonymous User",
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["client", "freelancer", "undecided"],
        message: "Role must be client, freelancer, or undecided",
      },
      default: "undecided",
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    completedGigs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Regenerates the nonce to a new random value.
 * Called after every successful login to prevent replay attacks.
 */
userSchema.methods.regenerateNonce = function () {
  this.nonce = crypto.randomBytes(16).toString("hex");
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
