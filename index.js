import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import carRoutes from "./routes/carRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rentals", rentalRoutes);

app.get("/", (req, res) => {
  res.send("Server Rental Mobil Ready");
});

app.listen(process.env.PORT, () => {
  console.log("Server jalan di port ", process.env.PORT);
});
