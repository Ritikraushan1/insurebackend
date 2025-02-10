const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisClient');

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token; // Assuming the token is stored in 'authToken'
    console.log("Token from Cookie:", token);

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }
  const blackListed = await redisClient.get(token);
  console.log("blacklisted", blackListed);
  
  if (blackListed) {
    return res
      .status(401)
      .json({ error: "Token is expired" });
  }
  console.log("Token Received user:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.user = decoded;  // Attach decoded user info to the request object

    next();  // Move to the next middleware or route handler
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const token = req.cookies.token; // Assuming the token is stored in 'authToken'
  console.log("Token from Cookie:", token);

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No token provided." });
  }
  const blackListed = await redisClient.get(token);
  if (blackListed) {
    return res
      .status(401)
      .json({ error: "Token is expired" });
  }
  console.log("Token Received:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    if (decoded.role !== 'admin') {
      return res.status(401).json({ error: "You can't perform this action" })
    }
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message); // Debug verification error
    return res.status(403).json({ error: "Invalid or expired token." });
  }

}
module.exports = { authenticateUser, authenticateAdmin }