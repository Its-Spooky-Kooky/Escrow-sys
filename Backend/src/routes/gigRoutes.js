const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
} = require("../controllers/gigController");

/**
 * Gig Routes
 *
 * GET    /api/gigs      — List all gigs (public, with optional filters)
 * POST   /api/gigs      — Create a new gig draft (requires JWT)
 * GET    /api/gigs/:id  — Get a specific gig by ID (public)
 * PUT    /api/gigs/:id  — Update a gig (requires JWT, owner only)
 */

router.route("/").get(getGigs).post(auth, createGig);

router.route("/:id").get(getGigById).put(auth, updateGig);

module.exports = router;
