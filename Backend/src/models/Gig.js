const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Gig title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Gig description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    amount: {
      type: String,
      required: [true, "Gig amount is required"],
      // Stored as a string to preserve the full precision of wei values
      // (JavaScript numbers lose precision beyond 2^53)
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending_funding",
          "funded",
          "in_progress",
          "completed",
          "released",
          "disputed",
          "refunded",
        ],
        message: "Invalid gig status: {VALUE}",
      },
      default: "pending_funding",
    },
    blockchainEscrowId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values (only enforces uniqueness on non-null)
    },
    contractAddress: {
      type: String,
      default: null,
    },
    txHash: {
      type: String,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for common query patterns
gigSchema.index({ status: 1 });
gigSchema.index({ client: 1, status: 1 });
gigSchema.index({ freelancer: 1, status: 1 });

const Gig = mongoose.model("Gig", gigSchema);

module.exports = Gig;
