import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;