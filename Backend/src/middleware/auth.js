const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT Authentication Middleware
 *
 * Protects routes by verifying the Bearer token in the Authorization header.
 * On success, attaches the full user document to `req.user`.
 */
const auth = async (req, res, next) => {
  try {
    // 1. Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify the token signature and decode the payload
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please log in again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token. Authentication failed.",
      });
    }

    // 3. Look up the user in the database to ensure they still exist
    const user = await User.findById(decoded.id).select("-nonce");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }

    // 4. Attach user to the request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
