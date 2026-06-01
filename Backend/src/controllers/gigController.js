const Gig = require("../models/Gig");
const User = require("../models/User");

/**
 * @desc    Create a new gig draft (off-chain)
 * @route   POST /api/gigs
 * @access  Private (requires JWT)
 *
 * Clients create gig drafts specifying terms, description, and amount.
 * The gig starts with status "pending_funding" until the smart contract
 * is funded on-chain.
 */
const createGig = async (req, res, next) => {
  try {
    const { title, description, amount, freelancerWallet, freelancerAddress, deadline, tags } =
      req.body;

    // Basic validation
    if (!title || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: "title, description, and amount are all required.",
      });
    }

    // Support both key names for robust client compatibility
    const fWallet = freelancerWallet || freelancerAddress;
    let freelancerId = null;

    if (fWallet) {
      const normalizedFreelancer = fWallet.toLowerCase();
      let freelancerUser = await User.findOne({ walletAddress: normalizedFreelancer });
      if (!freelancerUser) {
        freelancerUser = await User.create({ walletAddress: normalizedFreelancer });
        console.log(`[Gig] Registered new user for freelancer: ${normalizedFreelancer}`);
      }
      freelancerId = freelancerUser._id;
    }

    const gigData = {
      title,
      description,
      amount,
      client: req.user._id,
      freelancer: freelancerId,
      deadline: deadline ? new Date(deadline) : null,
      tags: tags || [],
    };

    const gig = await Gig.create(gigData);

    console.log(`[Gig] Created draft: "${title}" by ${req.user.walletAddress}`);

    res.status(201).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all gigs with optional filtering
 * @route   GET /api/gigs
 * @access  Public
 *
 * Supports query parameters:
 *   - status: Filter by gig status (e.g., ?status=funded)
 *   - client: Filter by client user ID
 *   - freelancer: Filter by freelancer user ID
 *   - page: Page number for pagination (default: 1)
 *   - limit: Number of results per page (default: 20)
 */
const getGigs = async (req, res, next) => {
  try {
    const { status, client, freelancer, page = 1, limit = 20 } = req.query;

    // Build the filter object dynamically
    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (freelancer) filter.freelancer = freelancer;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [gigs, total] = await Promise.all([
      Gig.find(filter)
        .populate("client", "walletAddress name rating")
        .populate("freelancer", "walletAddress name rating")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Gig.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: gigs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: gigs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single gig by its MongoDB ID
 * @route   GET /api/gigs/:id
 * @access  Public
 */
const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("client", "walletAddress name rating")
      .populate("freelancer", "walletAddress name rating");

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a gig (only the client who created it can update)
 * @route   PUT /api/gigs/:id
 * @access  Private (requires JWT)
 *
 * Only allows updates while the gig is still in "pending_funding" status.
 * Once funded on-chain, modifications are locked.
 */
const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found.",
      });
    }

    // Only the client who created the gig can update it
    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this gig.",
      });
    }

    // Only allow updates before the gig is funded on-chain
    if (gig.status !== "pending_funding") {
      return res.status(400).json({
        success: false,
        message: `Cannot modify a gig with status "${gig.status}". Only pending_funding gigs can be edited.`,
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "amount",
      "deadline",
      "tags",
    ];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedGig = await Gig.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    console.log(`[Gig] Updated: "${updatedGig.title}" by ${req.user.walletAddress}`);

    res.status(200).json({
      success: true,
      data: updatedGig,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGig, getGigs, getGigById, updateGig };
