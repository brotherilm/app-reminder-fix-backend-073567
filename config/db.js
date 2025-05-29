import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

let clientInstance = null;

export async function connectToDatabase() {
  // If we already have a client, return it
  if (clientInstance) {
    return clientInstance;
  }

  try {
    // Create a new client without deprecated options
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // Establish connection
    await client.connect();

    // Store client instance
    clientInstance = client;

    console.log("Connected to MongoDB");
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (clientInstance) {
    await clientInstance.close();
    console.log("MongoDB connection closed");
    clientInstance = null;
  }
}

// import { MongoClient } from "mongodb";
// import dotenv from "dotenv";

// dotenv.config();

// const MONGODB_URI = "mongodb://localhost:27017/mydatabase";

// let clientInstance = null;

// export async function connectToDatabase() {
//   // Jika sudah ada instance client, kembalikan instance tersebut
//   if (clientInstance) {
//     return clientInstance;
//   }

//   try {
//     // Buat client baru
//     const client = new MongoClient(MONGODB_URI, {
//       connectTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });

//     // Buat koneksi
//     await client.connect();

//     // Simpan instance client
//     clientInstance = client;

//     console.log("Berhasil terhubung ke MongoDB lokal");
//     return client;
//   } catch (error) {
//     console.error("Error koneksi MongoDB:", error);
//     throw error;
//   }
// }

// export async function closeDatabaseConnection() {
//   if (clientInstance) {
//     await clientInstance.close();
//     console.log("Koneksi MongoDB ditutup");
//     clientInstance = null;
//   }
// }
