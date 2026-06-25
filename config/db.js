import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  uri: process.env.DB_URL,
  // host: process.env.DB_HOST,
  // port: Number(process.env.DB_PORT),
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true, // Memastikan koneksi aman menggunakan certificate bawaan node
    ca: process.env.DB_CA_CERT
      ? Buffer.from(process.env.DB_CA_CERT, "base64").toString("utf-8")
      : undefined,
  },
});

export default db;
