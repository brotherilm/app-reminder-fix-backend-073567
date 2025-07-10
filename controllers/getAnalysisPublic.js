import { connectToDatabase } from "../config/db.js";

export const getListAirdrop = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    // Get all users with additionalAirdrop data
    const users = await collection
      .find({
        additionalAirdrop: { $exists: true, $not: { $size: 0 } },
      })
      .toArray();

    // Extract and flatten all additionalAirdrop entries
    const allAirdrops = users.flatMap((user) =>
      user.additionalAirdrop.map((airdrop) => ({
        airdropId: airdrop.airdropId,
        name: airdrop.name || "-",
        modal: parseFloat(airdrop.modal) || 0,
        profit: parseFloat(airdrop.profit) || 0,
      }))
    );

    return res.status(200).json({
      count: allAirdrops.length,
      details: allAirdrops,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
