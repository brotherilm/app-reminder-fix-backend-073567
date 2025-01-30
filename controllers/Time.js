import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

// Controller to update countdown
export async function Countdown(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;

    const { time } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Missing required fields: _id",
      });
    }

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

    // Calculate countdown end time
    const startTime = Date.now();
    const endTime = startTime + parseInt(time) * 1000; // Convert seconds to milliseconds

    const result = await collection.updateOne(
      {
        _id: objectId,
      },
      {
        $set: {
          "additionalAirdrop.$[].attempt": 0, // Mengubah semua elemen array attempt menjadi 0
          time: time,
          countdownStart: startTime,
          countdownEnd: endTime,
        },
      }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

// Controller to get countdown data for a user
export async function GetCountdown(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;

    if (!_id) {
      return res.status(400).json({
        message: "Missing required fields: _id",
      });
    }

    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid _id",
      });
    }

    const objectId = new ObjectId(_id);

    // Find user by ObjectId
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if countdown data exists
    if (!user.countdownStart || !user.countdownEnd) {
      return res.status(404).json({ message: "Countdown data not available" });
    }

    const currentTime = Date.now();
    const remainingTime = Math.max(user.countdownEnd - currentTime, 0); // Ensure non-negative remaining time

    res.status(200).json({
      message: "Countdown data retrieved successfully",
      countdown: {
        start: user.countdownStart,
        end: user.countdownEnd,
        remainingTime: remainingTime, // Remaining time in milliseconds
        isCountdownActive: remainingTime > 0, // Boolean indicating if countdown is active
      },
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
