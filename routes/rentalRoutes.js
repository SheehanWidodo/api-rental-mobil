import express from "express";
import {
  createRental,
  returnCar,
  cancelRental,
  refreshRentalStatuses,
  getAllRentals,
  getRentalsByUserLogin,
  getRentalsByUserId,
} from "../controllers/rentalController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/checkout",
  verifyUser(["Admin", "Petugas", "Pelanggan"]),
  createRental,
);
router.put(
  "/cancel/:id",
  verifyUser(["Admin", "Petugas", "Pelanggan"]),
  cancelRental,
);

router.get(
  "/user/history",
  verifyUser(["Pelanggan"]),
  getRentalsByUserLogin,
);

router.get(
  "/user/:id_user",
  verifyUser(["Admin", "Petugas"]),
  getRentalsByUserId,
);

router.put(
  "/refresh",
  verifyUser(["Admin", "Petugas", "Pelanggan"]),
  refreshRentalStatuses,
);

router.put("/return/:id", verifyUser(["Admin", "Petugas"]), returnCar);
router.get("/all", verifyUser(["Admin", "Petugas"]), getAllRentals);
export default router;
