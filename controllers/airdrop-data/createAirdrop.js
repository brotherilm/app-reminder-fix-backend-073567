import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

export async function createAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    // Get user ID from the verified token (added by verifyToken middleware)
    const userId = req.user.userId;

    const { name, timer, rating } = req.body;

    if (!name || !timer || !rating) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name, timer, rating" });
    }

    // Find user by userId from token
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a unique ID for the airdrop
    const airdropId = new ObjectId();

    // Calculate countdown (in milliseconds)
    const countdown = Date.now() + timer * 60 * 1000; // Convert minutes to milliseconds

    // Add record to the found user, with new airdrop ID
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          additionalAirdrop: {
            airdropId,
            name,
            timer,
            rating,
            countdown, // Store countdown as timestamp
            createdAt: Date.now(),
          },
        },
      }
    );

    res.status(201).json({
      success: true,
      message: "Airdrop created successfully",
      result,
    });
  } catch (error) {
    console.error("Create airdrop error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating airdrop",
      error: error.toString(),
    });
  }
}
