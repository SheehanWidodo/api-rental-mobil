import db from "../config/db.js";

const findCarById = async (id) => {
  const [rows] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
};

export const getAllCars = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cars");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data mobil" });
  }
};

export const getCarById = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await findCarById(id);
    if (!car)
      return res
        .status(404)
        .json({ success: false, message: "Car not found!" });
    res.json({ success: true, data: car });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data mobil!" });
  }
};

export const getCarByName = async (req, res) => {
  const { nama_mobil } = req.query;
  try {
    if (!nama_mobil)
      return res
        .status(400)
        .json({ success: false, message: "Keyword kosong!" });
    const [rows] = await db.query(
      "SELECT * FROM cars WHERE nama_mobil LIKE ?",
      [`%${nama_mobil}%`],
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data mobil!" });
  }
};

export const createCar = async (req, res) => {
  const { nama_mobil, transmisi, harga } = req.body;

  if (!nama_mobil || !transmisi || !harga)
    return res
      .status(400)
      .json({ success: false, message: "Data tidak lengkap" });

  try {
    await db.query(
      "INSERT INTO cars (nama_mobil, transmisi, harga) VALUES (?,?,?)",
      [nama_mobil, transmisi, harga],
    );
    res
      .status(201)
      .json({ success: true, message: "Berhasil menambahkan data mobil!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal menambahkan data mobil!" });
  }
};

export const udpateCar = async (req, res) => {
  const { id } = req.params;
  const { nama_mobil, transmisi, harga, status } = req.body;

  try {
    const car = await findCarById(id);
    if (!car)
      return res
        .status(404)
        .json({ success: false, message: "Car not found!" });

    await db.query(
      "UPDATE cars SET nama_mobil = ?, transmisi = ?, harga = ?, status = ? WHERE id = ? ",
      [nama_mobil, transmisi, harga, status, id],
    );
    res
      .status(200)
      .json({ success: true, message: "Berhasil memperbarui data mobil!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui data mobil!" });
  }
};

export const deleteCar = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await findCarById(id);
    if (!car)
      return res
        .status(404)
        .json({ success: false, message: "Car not found!" });

    await db.query("DELETE FROM cars WHERE id=?", [id]);
    res
      .status(200)
      .json({ success: true, message: "Berhasil menghapus data mobil!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal menghapus data mobil!" });
  }
};
