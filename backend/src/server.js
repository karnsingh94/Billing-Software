import dotenv from "dotenv";
import app from "./app.js";
import prisma from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Database connection failed");
    console.log(error.message);
    process.exit(1);
  }
};

startServer();