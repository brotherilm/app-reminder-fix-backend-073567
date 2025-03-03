import { connectToDatabase } from "../config/db.js";
import { generateToken } from "../middleware/jwtToken.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import validator from "validator";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

// Custom sanitization middleware
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return validator.escape(input.trim());
};

// Validation middleware
export const validateRegistration = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom((value) => {
      const domain = value.split("@")[1];
      if (domain.toLowerCase() !== "gmail.com") {
        throw new Error("Only gmail.com emails are allowed");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 6 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/)
    .withMessage(
      "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];

export const validateLogin = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").notEmpty().trim(),
];

export async function register(req, res) {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    let { email, password, additionalAirdrop } = req.body;

    // Additional sanitization
    email = sanitizeInput(email);

    if (!email || !password) {
      return res.status(400).json({
        message: "data are required",
      });
    }

    // Check if email already exists
    const existingUser = await collection.findOne(
      { email: email },
      { projection: { _id: 1 } }
    );

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const newUser = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
      additionalAirdrop: additionalAirdrop,
    };

    const result = await collection.insertOne(newUser);

    // Don't send password back in response
    res.status(201).json({
      message: "Registration successful",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function login(req, res) {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    let { email, password } = req.body;

    // Additional sanitization
    email = sanitizeInput(email);

    // Find user by email
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Update last login
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token with proper user ID
    const token = generateToken({
      _id: user._id,
      email: user.email,
    });

    // Set the token in HttpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 14400000, // 4 hours
    });

    // Send response
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const getProfile = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;

    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid _id",
      });
    }

    const objectId = new ObjectId(_id);

    // Cari user berdasarkan ObjectId tertentu

    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      email: user.email,
      password: user.password,
      verifiedStatus: user.verifiedStatus,
      subcriptionStatus: user.subcriptionStatus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
