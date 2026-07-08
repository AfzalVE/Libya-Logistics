import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. x-user-id header is missing.",
      });
    }

    const user = await User.findById(userId).populate("role").populate("warehouse");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. User not found.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive or suspended.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Role information missing.",
      });
    }

    const hasRole = roles.includes(req.user.role.name);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: ${roles.join(", ")}.`,
      });
    }

    next();
  };
}
