import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAnalysisPublic = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");
    
    // Ambil semua user
    const users = await collection.find({}).toArray();
    
    const allAirdrops = [];
    
    // Kumpulkan data airdrop tanpa informasi finansial
    users.forEach(user => {
      if (user.additionalAirdrop && Array.isArray(user.additionalAirdrop)) {
        user.additionalAirdrop.forEach((airdrop) => {
          allAirdrops.push({
            airdropId: airdrop.airdropId,
            name: airdrop.name || "-",
            // Informasi lain yang ingin ditampilkan (kecuali data finansial)
            // Contoh:
            // status: airdrop.status,
            // category: airdrop.category,
            // date: airdrop.date
          });
        });
      }
    });
    
    return res.status(200).json({
      success: true,
      count: allAirdrops.length,
      airdrops: allAirdrops
    });
    
  } catch (error) {
    console.error("Public Analysis Error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch public airdrop data" 
    });
  }
};
