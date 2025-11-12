const users = require("../models/User");

// Middleware to check if user is logged in and attach user to req.user
async function checkForLogin(req, res, next) {
  try {
    if (!req.session.userId) {
      console.log(" No session found");
      return res.status(403).json({ message: "Login first to continue" });
    }

    const user = await users.findById(req.session.userId);
    if (!user) {
      console.log(" No user found in DB for ID:", req.session.userId);
      return res.status(403).json({ message: "User not found" });
    }

    req.user = user;

    // Add this log line right here
    console.log("Attached user to req:", req.user._id, req.user.role);

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(500).json({ error: "Authentication error" });
  }
}

// Middleware to authorize based on role
function authRoles(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (req.user.role === requiredRole.toUpperCase()) {
      return next();
    }

    return res.status(403).json({
      message: `You are not authorised as ${requiredRole}`,
    });
  };
}

module.exports = { authRoles, checkForLogin };
