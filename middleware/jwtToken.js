import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

dotenv.config();

// Updated token generation function
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(), // Convert ObjectId to string
      email: user.email,
    },
    process.env.JWT_TOKEN,
    { expiresIn: "4h" }
  );
}

// Updated token verification middleware
export async function verifyToken(req, res, next) {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // If no token in header, check cookies
    if (!token && req.cookies) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);

    // Verify user exists in database
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const user = await collection.findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user information to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      _id: user._id,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}
