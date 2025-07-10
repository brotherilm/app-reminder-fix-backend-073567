import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAnalysisPublic = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");
    
    // Ambil semua user (atau bisa juga ditambahkan parameter untuk filter tertentu)
    const users = await collection.find({}).toArray();
    
    let totalModalAll = 0;
    let totalProfitAll = 0;
    let totalCount = 0;
    const allAirdrops = [];
    
    // Hitung total untuk semua user
    users.forEach(user => {
      if (user.additionalAirdrop && Array.isArray(user.additionalAirdrop)) {
        user.additionalAirdrop.forEach((airdrop) => {
          const modal = parseFloat(airdrop.modal) || 0;
          const profit = parseFloat(airdrop.profit) || 0;
          totalModalAll += modal;
          totalProfitAll += profit;
          totalCount++;
          
          allAirdrops.push({
            userId: user._id,
            airdropId: airdrop.airdropId,
            name: airdrop.name || "-",
            modal: modal,
            profit: profit,
            PNL: profit - modal
          });
        });
      }
    });
    
    const PNLAall = totalProfitAll - totalModalAll;
    
    return res.status(200).json({
      totalModal: totalModalAll,
      totalProfit: totalProfitAll,
      PNL: PNLAall,
      count: totalCount,
      details: allAirdrops
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
