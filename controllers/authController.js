import db from "../config/db.js";

export const Register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Data tidak lengkap" });

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username=? OR email=?",
      [username, email],
    );
    if (existingUser.length > 0) {
      const user = existingUser[0];

      if (user.email === email) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }
      if (user.username === username) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
    }

    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?,?,SHA2(?,256))",
      [username, email, password],
    );

    res.status(201).json({
      success: true,
      message: "Akun pelanggan berhasil didaftarkan",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal Registrasi!" });
  }
};

export const Login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = SHA2(?,256)",
      [username, password],
    );
    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Username atau Password salah" });

    const user = rows[0];
    //pura-pura JWT Token padahal cuma base64
    const token = Buffer.from(JSON.stringify(user)).toString("base64");

    res.json({
      success: true,
      message: "Login Sukses",
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal Login!" });
  }
};

export const Logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil logout",
  });
};
