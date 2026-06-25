import express from "express";
import {
  getAllCars,
  getCarById,
  getCarByName,
  createCar,
  udpateCar,
  deleteCar,
} from "../controllers/carController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCars);
router.get("/search", getCarByName);
router.get("/:id", getCarById);

router.post("/", verifyUser(["Admin", "Petugas"]), createCar);
router.put("/:id", verifyUser(["Admin", "Petugas"]), udpateCar);
router.delete("/:id", verifyUser(["Admin", "Petugas"]), deleteCar);

export default router;
