import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getTotalModalProfit = async (req, res) => {
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

    // Cek apakah user memiliki additionalAirdrop
    if (!user.additionalAirdrop || !Array.isArray(user.additionalAirdrop)) {
      return res.status(200).json({
        totalModal: 0,
        totalProfit: 0,
        PNL: 0,
        count: 0,
        message: "No additional airdrop data found",
      });
    }

    // Hitung total modal, profit, dan PNL
    let totalModal = 0;
    let totalProfit = 0;

    user.additionalAirdrop.forEach((airdrop) => {
      // Pastikan modal dan profit adalah angka
      const modal = parseFloat(airdrop.modal) || 0;
      const profit = parseFloat(airdrop.profit) || 0;

      totalModal += modal;
      totalProfit += profit;
    });

    const PNL = totalProfit - totalModal;

    return res.status(200).json({
      totalModal: totalModal,
      totalProfit: totalProfit,
      PNL: PNL,
      count: user.additionalAirdrop.length,
      details: user.additionalAirdrop.map((airdrop) => ({
        airdropId: airdrop.airdropId,
        name: airdrop.name || "-",
        modal: parseFloat(airdrop.modal) || 0,
        profit: parseFloat(airdrop.profit) || 0,
        PNL:
          (parseFloat(airdrop.profit) || 0) - (parseFloat(airdrop.modal) || 0),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
