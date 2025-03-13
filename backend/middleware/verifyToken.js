const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    console.log("Token received:", token); // Log the received token
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft(); // Remove "Bearer " prefix
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded); // Log the decoded token
    
    if (!decoded || typeof decoded !== 'object') {
      return res.status(403).json({ message: "Access denied. Invalid token format." });
    }
    
    // If the token has an ID but no role, assume it's an admin token
    // This handles older tokens that were generated before the role field was added
    if (!decoded.role) {
      // Check if the token has an ID field
      if (decoded.id) {
        // Set the user object on the request
        req.user = decoded;
        req.adminId = decoded.id; // For backward compatibility
        return next();
      }
      
      if (decoded.adminId || decoded.superAdminId) {
        req.user = decoded;
        return next();
      }
      
      return res.status(403).json({ message: "Access denied. Role not specified in token." });
    }
    
    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }
    
    req.user = decoded;
    req.adminId = decoded.id; // For backward compatibility
    next();
  } catch (error) {
    console.error("Token verification failed:", error); // Log the error
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please login again." });
    }
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = { verifyAdminToken };
