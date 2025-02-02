import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

// Controller to update countdown
export async function createAccordition(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;
    const { accorditionLabel } = req.body;

    if (!_id || !accorditionLabel) {
      return res.status(400).json({
        message: "Missing required fields: accorditionLabel",
      });
    }

    // Validasi _id agar sesuai dengan format ObjectId MongoDB
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

    // Buat accorditionId baru menggunakan ObjectId
    const accorditionId = new ObjectId();

    // Tambahkan data ke dalam array accorditions dengan accorditionId
    const updateResult = await collection.updateOne(
      { _id: objectId },
      { $push: { accorditions: { _id: accorditionId, accorditionLabel } } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to update user data" });
    }

    return res.status(200).json({
      message: "Accordition added successfully",
      accorditionId: accorditionId, // Mengembalikan accorditionId yang baru dibuat
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAccorditions(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;

    if (!_id) {
      return res
        .status(400)
        .json({ message: "Missing required field: userId" });
    }

    // Validasi apakah _id sesuai format ObjectId MongoDB
    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const objectId = new ObjectId(_id);

    // Cari user berdasarkan ObjectId
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kirim data accorditions jika tersedia
    return res.status(200).json({ accorditions: user.accorditions || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function editAccordition(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;
    const { accorditionId, accorditionLabel } = req.body;

    if (!_id || !accorditionId) {
      return res.status(400).json({
        message: "Missing required fields: accorditionId or accorditionLabel",
      });
    }

    // Validasi _id agar sesuai dengan format ObjectId MongoDB
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(accorditionId)) {
      return res.status(400).json({
        message: "Invalid _id or accorditionId",
      });
    }

    const userId = new ObjectId(_id);
    const accorditionObjectId = new ObjectId(accorditionId);

    // Cari user berdasarkan ObjectId
    const user = await collection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cari dan update accordition berdasarkan accorditionId
    const updateResult = await collection.updateOne(
      { _id: userId, "accorditions._id": accorditionObjectId },
      { $set: { "accorditions.$.accorditionLabel": accorditionLabel } }
    );

    // Jika tidak ada error, anggap operasi berhasil
    return res
      .status(200)
      .json({ message: "Accordition updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAccordition(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const _id = req.user.userId;
    const { accorditionId } = req.body;

    if (!_id || !accorditionId) {
      return res.status(400).json({
        message: "Missing required field: accorditionId",
      });
    }

    // Validasi _id agar sesuai dengan format ObjectId MongoDB
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(accorditionId)) {
      return res.status(400).json({
        message: "Invalid _id or accorditionId",
      });
    }

    const userId = new ObjectId(_id);
    const accorditionObjectId = new ObjectId(accorditionId);

    // Cari user berdasarkan ObjectId
    const user = await collection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hapus accordition berdasarkan accorditionId
    const updateResult = await collection.updateOne(
      { _id: userId },
      { $pull: { accorditions: { _id: accorditionObjectId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ message: "can't found airdropId" });
    }

    return res
      .status(200)
      .json({ message: "Accordition deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
