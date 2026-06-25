import db from "../config/db.js";

export const createRental = async (req, res) => {
  const { id_user, id_mobil, tgl_mulai, tgl_selesai } = req.body;
  if (!id_user || !id_mobil || !tgl_mulai || !tgl_selesai)
    return res
      .status(400)
      .json({ success: false, message: "Data tidak lengkap" });

  try {
    const [cars] = await db.query("SELECT * FROM cars WHERE id=?", [id_mobil]);
    if (cars.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });

    const car = cars[0];
    if (car.status !== "Ready")
      return res
        .status(400)
        .json({ success: false, message: "Mobil sedang disewa" });

    const tglMulai = new Date(tgl_mulai);
    const tglSelesai = new Date(tgl_selesai);

    //Rumus hitung selisih hari: (Milidetik selesai - Milidetik mulai) / total milidetik sehari
    const selisihWaktu = tglSelesai.getTime() - tglMulai.getTime();
    const totalHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));

    if (totalHari <= 0)
      return res.status(400).json({
        success: false,
        message: "Tanggal kembali tidak valid (minimal sewa 1 hari)!",
      });

    const totalBayar = totalHari * car.harga;

    await db.query(
      "INSERT INTO rentals (id_user, id_mobil, tgl_mulai, tgl_selesai, total_bayar) VALUES (?,?,?,?,?)",
      [id_user, id_mobil, tgl_mulai, tgl_selesai, totalBayar],
    );
    await db.query('UPDATE cars SET status = ? WHERE id=?', ["Rented",id_mobil]);

    res.status(201).json({
      success: true,
      message: "Transaksi Berhasil!",
      detail_transaksi: {
        total_hari: totalHari,
        total_bayar: totalBayar,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menambahkan transaksi" });
  }
};

export const returnCar = async (req, res) => {
  const { id } = req.params;
  try {
    const [rentalRows] = await db.query("SELECT * FROM rentals WHERE id=?", [
      id,
    ]);
    if (rentalRows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });

    const rental = rentalRows[0];
    if (rental.status !== "Active")
      return res
        .status(400)
        .json({ success: false, message: "Mobil sudah dikembalikan" });

    await db.query("UPDATE rentals SET status = 'Completed' WHERE id=?", [id]);
    await db.query("UPDATE cars SET status = 'Ready' WHERE id=?", [
      rental.id_mobil,
    ]);

    res.status(200).json({
      success: true,
      message: "Persewaan sudah selesai",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui transaksi" });
  }
};

export const cancelRental = async (req, res) => {
  const { id } = req.params;

  try {
    //UPDATE STATUS RENTAL berdasarkan TANGGAL SEKARANG
    await db.query(
      'UPDATE rentals SET status = ? WHERE status = ? AND CURDATE() >= tgl_mulai', ["Active","Booking"]
    );

    const [rentalRows] = await db.query("SELECT * FROM rentals WHERE id=?", [
      id,
    ]);
    if (rentalRows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });

    const rental = rentalRows[0];

    const tglSekarang = new Date();
    const tglMulai = new Date(rental.tgl_mulai);

    if (tglSekarang.getTime() >= tglMulai.getTime())
      return res.status(400).json({
        success: false,
        message: "Gagal membatalkan! Jadwal sudah aktif",
      });
    if (rental.status !== "Booking")
      return res
        .status(400)
        .json({ success: false, message: "Transaksi tidak bisa dibatalkan" });

    await db.query("UPDATE rentals SET status = 'Cancelled' WHERE id = ?", [
      id,
    ]);
    await db.query("UPDATE cars SET status = 'Ready' WHERE id = ?", [
      rental.id_mobil,
    ]);

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil dibatalkan",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui transaksi" });
  }
};

export const refreshRentalStatuses = async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE rentals SET status = ? WHERE status = ? AND CURDATE() >= tgl_mulai', ["Active","Booking"]
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Status berhasil di refresh " + result.affectedRows,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui transaksi" });
  }
};

export const getAllRentals = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT r.*, u.username, c.nama_mobil, c.transmisi FROM rentals r JOIN users u ON r.id_user = u.id JOIN cars c ON r.id_mobil = c.id ORDER BY r.tgl_mulai DESC",
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui transaksi" });
  }
};

export const getRentalsByUserLogin = async (req, res) => {
    try {
        const id = req.user.id
         const [rows] = await db.query(
      "SELECT r.*, c.nama_mobil, c.transmisi FROM rentals r JOIN users u ON r.id_user = u.id JOIN cars c ON r.id_mobil = c.id WHERE r.id_user = ? ORDER BY r.tgl_mulai DESC",[id]
    );
    res.status(200).json({success:true, data:rows})
    } catch (error) {
            console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui transaksi" });
    }
}

export const getRentalsByUserId = async (req, res) => {
    try {
        const {id_user} = req.params
         const [rows] = await db.query(
      "SELECT r.*, c.nama_mobil, c.transmisi FROM rentals r JOIN users u ON r.id_user = u.id JOIN cars c ON r.id_mobil = c.id WHERE r.id_user = ? ORDER BY r.tgl_mulai DESC",[id_user]
    );
    res.status(200).json({success:true, data:rows})
    } catch (error) {
            console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui transaksi" });
    }
}