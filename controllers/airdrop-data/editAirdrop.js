import { connectToDatabase } from "../../config/db.js";
import validator from "validator";
import { ObjectId } from "mongodb";

// Helper function untuk sanitasi input (hanya untuk teks biasa)
const sanitizeInput = (input) => {
  if (input === undefined || input === null) return "";
  if (typeof input !== "string") return input.toString();
  return validator.escape(input.trim());
};

export async function editAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    // Get user ID from the verified token (added by verifyToken middleware)
    const _id = req.user.userId;

    const {
      airdropId,
      name,
      timer,
      rating,
      LinkTelegramPlay,
      LinkWebPlay,
      LinkTelegramChannel,
      LinkWebAnnountcement,
      LinkX,
      senin,
      selasa,
      rabu,
      kamis,
      jumat,
      sabtu,
      minggu,
      funding,
      modal,
      profit,
    } = req.body;

    // Validasi basic
    if (!airdropId || !name || !timer) {
      return res.status(400).json({
        message: "Missing required fields: _id, airdropId, name, timer",
      });
    }

    // Validasi ObjectId untuk mencegah injection
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    // Sanitize hanya untuk field non-URL
    const updatedData = {
      name: sanitizeInput(name),
      timer: sanitizeInput(timer),
      rating: sanitizeInput(rating),
      // URL tidak di-sanitize
      LinkTelegramPlay,
      LinkWebPlay,
      LinkTelegramChannel,
      LinkWebAnnountcement,
      LinkX,
      senin,
      selasa,
      rabu,
      kamis,
      jumat,
      sabtu,
      minggu,
      funding,
      modal,
      profit,
    };

    const objectId = new ObjectId(_id);

    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const objectAirdropId = new ObjectId(airdropId);

    // Update dengan data yang sudah diproses
    const result = await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      {
        $set: {
          "additionalAirdrop.$.name": updatedData.name,
          "additionalAirdrop.$.timer": updatedData.timer,
          "additionalAirdrop.$.rating": updatedData.rating,
          "additionalAirdrop.$.LinkTelegramPlay": updatedData.LinkTelegramPlay,
          "additionalAirdrop.$.LinkWebPlay": updatedData.LinkWebPlay,
          "additionalAirdrop.$.LinkTelegramChannel":
            updatedData.LinkTelegramChannel,
          "additionalAirdrop.$.LinkWebAnnountcement":
            updatedData.LinkWebAnnountcement,
          "additionalAirdrop.$.LinkX": updatedData.LinkX,
          "additionalAirdrop.$.senin": updatedData.senin,
          "additionalAirdrop.$.selasa": updatedData.selasa,
          "additionalAirdrop.$.rabu": updatedData.rabu,
          "additionalAirdrop.$.kamis": updatedData.kamis,
          "additionalAirdrop.$.jumat": updatedData.jumat,
          "additionalAirdrop.$.sabtu": updatedData.sabtu,
          "additionalAirdrop.$.minggu": updatedData.minggu,
          "additionalAirdrop.$.funding": updatedData.funding,
          "additionalAirdrop.$.modal": updatedData.modal,
          "additionalAirdrop.$.profit": updatedData.profit,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Airdrop not found",
      });
    }

    res.status(200).json({
      message: "Airdrop updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    // Get user ID from the verified token (added by verifyToken middleware)
    const _id = req.user.userId;

    const { airdropId } = req.body;

    // Perbaikan validasi parameter
    if (!_id || !airdropId) {
      return res.status(400).json({
        message: "Missing required fields: _id and airdropId",
      });
    }

    // Validasi format ObjectId
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    const objectId = new ObjectId(_id);

    // Cari user berdasarkan ObjectId tertentu
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const objectAirdropId = new ObjectId(airdropId);

    // Gunakan updateOne dengan $pull untuk menghapus airdrop spesifik
    const result = await collection.updateOne(
      { _id: objectId },
      {
        $pull: {
          additionalAirdrop: {
            airdropId: objectAirdropId,
          },
        },
      }
    );

    // Cek apakah user ditemukan
    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Cek apakah airdrop berhasil dihapus
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "Airdrop not found in user's collection",
      });
    }

    // Kirim response sukses
    return res.status(200).json({
      message: "Airdrop successfully deleted",
      result,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
