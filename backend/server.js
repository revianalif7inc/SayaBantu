// server.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;

/* ----------------------------------------------------------------------------
 * SMTP
 * --------------------------------------------------------------------------*/
const SMTP_PORT_NUM = Number(process.env.SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: SMTP_PORT_NUM,
  secure: SMTP_PORT_NUM === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  requireTLS: SMTP_PORT_NUM !== 465,
  tls: { minVersion: "TLSv1.2" },
});

transporter.verify((err, ok) => {
  if (err) {
    console.error("SMTP error:", err.message);
  } else {
    console.log("SMTP ready?", ok);
  }
});

async function sendResetEmail(to, link) {
  const from = process.env.SMTP_FROM || `Support <${process.env.SMTP_USER}>`;
  return transporter.sendMail({
    from,
    to,
    subject: "Reset Password",
    html: `
      <p>Anda meminta reset password.</p>
      <p>Link (berlaku 30 menit): <a href="${link}">${link}</a></p>
      <p>Abaikan jika Anda tidak meminta reset.</p>
    `,
  });
}

/* ----------------------------------------------------------------------------
 * DB Pool & helpers
 * --------------------------------------------------------------------------*/
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sayabantu",
  connectionLimit: 10,
});

db.getConnection((err, conn) => {
  if (err) throw err;
  console.log("Connected to MySQL");
  conn.release();
});

const q = (sql, params = []) =>
  db
    .promise()
    .query(sql, params)
    .then(([rows]) => rows);

// Utility function untuk menangani error dari query database
const sendDbError = (res, err, label) => {
  console.error(`[${label}] Error occurred:`, {
    message: err?.message || err?.sqlMessage,
    stack: err?.stack,
    sql: err?.sql || 'No SQL query available',
  });

  res.status(500).json({
    error: "Database error",
    detail: err?.sqlMessage || err?.message,
  });
};

/* ----------------------------------------------------------------------------
 * Middlewares & static
 * --------------------------------------------------------------------------*/
app.use(cors());
app.use(express.json());

// uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ----------------------------------------------------------------------------
 * Auth helpers
 * --------------------------------------------------------------------------*/
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}
const adminOnly = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ error: "Access denied: Admins only" });

/* ----------------------------------------------------------------------------
 * Utils
 * --------------------------------------------------------------------------*/
const btoi = (v) => (v ? 1 : 0);
const num = (v, d = 0) =>
  v === undefined || v === null || v === "" ? d : Number(v);

/* ----------------------------------------------------------------------------
 * SETTINGS helpers (logo & wa)
 * --------------------------------------------------------------------------*/
async function getPrimaryLogoUrl() {
  try {
    return (
      (
        await q(
          "SELECT url FROM logos WHERE placement='header' AND is_primary=1 AND is_active=1 ORDER BY id DESC LIMIT 1"
        )
      )[0]?.url || ""
    );
  } catch (e) {
    console.warn(
      "Primary logo query failed -> fallback:",
      e.sqlMessage || e.message
    );
    return (await q("SELECT url FROM logos ORDER BY id DESC LIMIT 1"))[0]?.url || "";
  }
}

async function getPrimaryWaFull() {
  try {
    const rows = await q(
      "SELECT phone, whatsapp_message FROM whatsapp_numbers WHERE is_primary=1 AND is_active=1 ORDER BY id DESC LIMIT 1"
    );
    if (rows.length) return rows[0];
  } catch (e) {
    console.warn("Primary WA query failed -> fallback:", e.sqlMessage || e.message);
  }
  const rows2 = await q(
    "SELECT phone, whatsapp_message FROM whatsapp_numbers ORDER BY id DESC LIMIT 1"
  );
  return rows2[0] || { phone: "", whatsapp_message: "" };
}
// untuk PUT /settings (pakai transaction `conn`)
async function updateLogoPrimary(conn, url) {
  const run = async (sql, params = []) => (await conn.query(sql, params))[0];
  try {
    const rows = await run(
      "SELECT id FROM logos WHERE placement='header' AND is_primary=1 LIMIT 1"
    );
    if (rows.length) {
      await run("UPDATE logos SET url=?, is_active=1 WHERE id=?", [
        url,
        rows[0].id,
      ]);
    } else {
      await run(
        "INSERT INTO logos (url, placement, is_primary, is_active) VALUES (?, 'header', 1, 1)",
        [url]
      );
    }
  } catch (e) {
    console.warn("updateLogoPrimary fallback:", e.sqlMessage || e.message);
    const rows = await run("SELECT id FROM logos ORDER BY id DESC LIMIT 1");
    if (rows.length) {
      await run("UPDATE logos SET url=? WHERE id=?", [url, rows[0].id]);
    } else {
      await run("INSERT INTO logos (url) VALUES (?)", [url]);
    }
  }
}

async function updateWaPrimary(conn, phone) {
  const run = async (sql, params = []) => (await conn.query(sql, params))[0];
  try {
    const rows = await run("SELECT id FROM whatsapp_numbers WHERE is_primary=1 LIMIT 1");
    if (rows.length) {
      await run("UPDATE whatsapp_numbers SET phone=?, is_active=1 WHERE id=?", [phone, rows[0].id]);
    } else {
      await run("INSERT INTO whatsapp_numbers (label, phone, is_primary, is_active) VALUES ('umum', ?, 1, 1)", [phone]);
    }
  } catch (e) {
    console.warn("updateWaPrimary fallback:", e.sqlMessage || e.message);
    const rows = await run("SELECT id FROM whatsapp_numbers ORDER BY id DESC LIMIT 1");
    if (rows.length) {
      await run("UPDATE whatsapp_numbers SET phone=? WHERE id=?", [phone, rows[0].id]);
    } else {
      await run("INSERT INTO whatsapp_numbers (phone) VALUES (?)", [phone]);
    }
  }
}


/* ----------------------------------------------------------------------------
 * SETTINGS routes (admin)
 * --------------------------------------------------------------------------*/
app.get("/settings", authenticateToken, adminOnly, async (req, res) => {
  try {
    const logo_url = await getPrimaryLogoUrl();
    const wa = await getPrimaryWaFull(); // <—
    res.json({
      logo_url,
      whatsapp_number: wa?.phone || "",
      whatsapp_message: wa?.whatsapp_message || ""  // <— penting
    });
  } catch (e) {
    sendDbError(res, e, "GET /settings");
  }
});

// Endpoint untuk memperbarui pengaturan WhatsApp
app.put("/settings/whatsapp", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { whatsapp_number, whatsapp_message } = req.body;
    if (!whatsapp_number || !whatsapp_message) {
      return res.status(400).json({ error: "Nomor WhatsApp dan pesan tidak boleh kosong." });
    }

    // Update nomor WhatsApp dan pesan
    const rows = await q("SELECT id FROM whatsapp_numbers WHERE is_primary=1 LIMIT 1");
    if (rows.length) {
      // Pastikan tidak ada koma setelah rows[0].id
      await q("UPDATE whatsapp_numbers SET phone=?, whatsapp_message=?, is_active=1 WHERE id=?", [whatsapp_number, whatsapp_message, rows[0].id]);
    } else {
      await q("INSERT INTO whatsapp_numbers (label, phone, whatsapp_message, is_primary, is_active) VALUES ('umum', ?, ?, 1, 1)", [whatsapp_number, whatsapp_message]);
    }

    return res.json({
      ok: true,
      whatsapp_number,
      whatsapp_message
    });
  } catch (e) {
    sendDbError(res, e, "PUT /settings/whatsapp");
  }
});


app.delete("/settings/logo", authenticateToken, adminOnly, async (req, res) => {
  try {
    // Cari logo utama yang terpasang di header
    let id;
    try {
      id = (
        await q(
          "SELECT id FROM logos WHERE placement='header' AND is_primary=1 LIMIT 1"
        )
      )[0]?.id;
    } catch (e) {
      console.warn(
        "DELETE /settings/logo fallback SELECT:",
        e.sqlMessage || e.message
      );
    }

    // Jika tidak ada logo utama di header, cari logo terakhir
    if (!id) id = (await q("SELECT id FROM logos ORDER BY id DESC LIMIT 1"))[0]?.id;

    if (!id) return res.status(404).json({ error: "Logo not found" });

    // Hapus logo berdasarkan ID
    await q("DELETE FROM logos WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "DELETE /settings/logo");
  }
});

app.delete(
  "/settings/whatsapp",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      // Cari nomor WhatsApp utama
      let id;
      try {
        id = (
          await q("SELECT id FROM whatsapp_numbers WHERE is_primary=1 LIMIT 1")
        )[0]?.id;
      } catch (e) {
        console.warn(
          "DELETE /settings/whatsapp fallback SELECT:",
          e.sqlMessage || e.message
        );
      }

      // Jika tidak ada nomor WhatsApp utama, cari nomor WhatsApp terakhir
      if (!id)
        id = (
          await q("SELECT id FROM whatsapp_numbers ORDER BY id DESC LIMIT 1")
        )[0]?.id;

      if (!id) return res.status(404).json({ error: "WhatsApp number not found" });

      // Hapus nomor WhatsApp berdasarkan ID
      await q("DELETE FROM whatsapp_numbers WHERE id=?", [id]);
      res.json({ ok: true });
    } catch (e) {
      sendDbError(res, e, "DELETE /settings/whatsapp");
    }
  }
);


/* ----------------------------------------------------------------------------
 * CRUD SERVICES/EMAILS/ADDRESSES/SOCIALS (admin)
 * --------------------------------------------------------------------------*/

// Endpoint untuk mendapatkan semua layanan
app.get("/services", authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await q("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
    res.json(rows);  // Mengirimkan data layanan dalam format JSON
  } catch (e) {
    sendDbError(res, e, "GET /services");  // Menangani error database
  }
});

// Endpoint untuk mendapatkan semua layanan
app.get("/services", authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await q("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
    res.json(rows);  // Mengirimkan data layanan dalam format JSON
  } catch (e) {
    sendDbError(res, e, "GET /services");  // Menangani error database
  }
});

// Endpoint untuk menambahkan layanan baru
app.post(
  "/services",
  authenticateToken,  // Pastikan token otentikasi valid
  adminOnly,          // Pastikan hanya admin yang bisa mengakses
  upload.single("icon_file"),  // Upload file ikon (jika ada)
  async (req, res) => {
    try {
      const {
        name,
        short_name,
        slug,
        summary,
        description,
        icon_type,
        icon_bg,
        price_min,
        price_unit,
        is_popular,
        is_active,
        sort_order,
      } = req.body;

      // Verifikasi bahwa data yang dibutuhkan ada
      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      // Verifikasi file ikon yang diupload
      let iconValue = "";
      if (req.file) {
        const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validFileTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ error: "Invalid file type. Only JPG, PNG, and GIF are allowed." });
        }
        iconValue = `/uploads/${req.file.filename}`;
      }

      // Query untuk menambahkan data layanan baru ke database
      const result = await q(
        `INSERT INTO services
        (name, short_name, slug, summary, description, icon_type, icon_value, icon_bg, price_min, price_unit, is_popular, is_active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name || "",
          short_name || null,
          slug || null,
          summary || null,
          description || null,
          icon_type || "image", // Default icon_type
          iconValue,
          icon_bg || null,
          num(price_min, null), // Pastikan harga minimum valid
          price_unit || null,
          btoi(is_popular),
          btoi(is_active ?? 1), // Status aktif atau tidak
          num(sort_order, 0),   // Urutan tampil
        ]
      );

      res.status(201).json({ ok: true, serviceId: result.insertId });  // Mengirimkan response sukses
    } catch (e) {
      sendDbError(res, e, "POST /services");  // Menangani error
    }
  }
);

app.put('/api/whatsapp-message', async (req, res) => {
  const { message } = req.body;
  try {
    // Update pesan di database
    await db.query('UPDATE whatsapp_messages SET message = $1 WHERE id = 1', [message]);
    res.status(200).send('Pesan berhasil diperbarui');
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui pesan' });
  }
});

// Endpoint untuk mengedit layanan berdasarkan ID
app.put(
  "/services/:id",
  authenticateToken,
  adminOnly,
  upload.single("icon_file"),  // Upload file ikon jika ada
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        short_name,
        slug,
        summary,
        description,
        icon_type,
        icon_bg,
        price_min,
        price_unit,
        is_popular,
        is_active,
        sort_order
      } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      // Verifikasi file ikon yang diupload
      let iconValue = "";
      if (req.file) {
        const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validFileTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ error: "Invalid file type. Only JPG, PNG, and GIF are allowed." });
        }
        iconValue = `/uploads/${req.file.filename}`;
      }

      // Query untuk memperbarui layanan berdasarkan ID
      const result = await q(
        `UPDATE services
        SET 
          name = ?, 
          short_name = ?, 
          slug = ?, 
          summary = ?, 
          description = ?, 
          icon_type = ?, 
          icon_value = ?, 
          icon_bg = ?, 
          price_min = ?, 
          price_unit = ?, 
          is_popular = ?, 
          is_active = ?, 
          sort_order = ?
        WHERE id = ?`,
        [
          name || "",
          short_name || null,
          slug || null,
          summary || null,
          description || null,
          icon_type || "image",  // Default icon_type jika tidak diisi
          iconValue,
          icon_bg || null,
          num(price_min, null),
          price_unit || null,
          btoi(is_popular),
          btoi(is_active ?? 1),
          num(sort_order, 0),
          id
        ]
      );

      res.status(200).json({ ok: true, serviceId: id });
    } catch (e) {
      sendDbError(res, e, "PUT /services/:id");
    }
  }
);

// Endpoint untuk menghapus layanan berdasarkan ID
app.delete("/services/:id", authenticateToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await q("DELETE FROM services WHERE id=?", [id]);

    // Jika tidak ada baris yang terhapus, berarti data tidak ditemukan
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });  // Mengirimkan response sukses
  } catch (e) {
    sendDbError(res, e, "DELETE /services/:id");  // Menangani error
  }
});



// EMAILS
app.get("/emails", authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await q("SELECT * FROM emails ORDER BY is_primary DESC, id ASC");
    res.json(rows);
  } catch (e) {
    sendDbError(res, e, "GET /emails");
  }
});

app.post("/emails", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { label, email, is_primary, is_active } = req.body;
    await q(
      "INSERT INTO emails (label, email, is_primary, is_active) VALUES (?, ?, ?, ?)",
      [label || "umum", email, btoi(is_primary), btoi(is_active ?? 1)]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "POST /emails");
  }
});

app.put("/emails/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { label, email, is_primary, is_active } = req.body;
    await q(
      "UPDATE emails SET label=?, email=?, is_primary=?, is_active=? WHERE id=?",
      [
        label || "umum",
        email,
        btoi(is_primary),
        btoi(is_active ?? 1),
        Number(req.params.id),
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "PUT /emails/:id");
  }
});

app.delete("/emails/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    await q("DELETE FROM emails WHERE id=?", [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "DELETE /emails/:id");
  }
});

// ADDRESSES
app.get("/addresses", authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await q(
      "SELECT * FROM addresses ORDER BY is_primary DESC, id ASC"
    );
    res.json(rows);
  } catch (e) {
    sendDbError(res, e, "GET /addresses");
  }
});

app.post("/addresses", authenticateToken, adminOnly, async (req, res) => {
  try {
    const {
      label,
      address_line,
      city,
      province,
      postal_code,
      maps_url,
      lat,
      lng,
      is_primary,
      is_active,
    } = req.body;
    await q(
      `INSERT INTO addresses
        (label, address_line, city, province, postal_code, maps_url, lat, lng, is_primary, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        label || "kantor",
        address_line || "",
        city || null,
        province || null,
        postal_code || null,
        maps_url || null,
        lat ?? null,
        lng ?? null,
        btoi(is_primary),
        btoi(is_active ?? 1),
      ]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "POST /addresses");
  }
});

app.put("/addresses/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const {
      label,
      address_line,
      city,
      province,
      postal_code,
      maps_url,
      lat,
      lng,
      is_primary,
      is_active,
    } = req.body;
    await q(
      `UPDATE addresses SET
          label=?, address_line=?, city=?, province=?, postal_code=?, maps_url=?, lat=?, lng=?,
          is_primary=?, is_active=?
        WHERE id=?`,
      [
        label || "kantor",
        address_line || "",
        city || null,
        province || null,
        postal_code || null,
        maps_url || null,
        lat ?? null,
        lng ?? null,
        btoi(is_primary),
        btoi(is_active ?? 1),
        Number(req.params.id),
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "PUT /addresses/:id");
  }
});

app.delete("/addresses/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    await q("DELETE FROM addresses WHERE id=?", [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "DELETE /addresses/:id");
  }
});

// SOCIALS
app.get("/socials", authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await q(
      "SELECT * FROM social_links ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows);
  } catch (e) {
    sendDbError(res, e, "GET /socials");
  }
});

app.post("/socials", authenticateToken, adminOnly, async (req, res) => {
  try {
    const {
      platform,
      handle,
      url,
      icon_type,
      icon_value,
      sort_order,
      is_active,
    } = req.body;
    await q(
      `INSERT INTO social_links
        (platform, handle, url, icon_type, icon_value, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        platform,
        handle || null,
        url,
        icon_type || "iconset",
        icon_value || null,
        num(sort_order, 0),
        btoi(is_active ?? 1),
      ]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "POST /socials");
  }
});

app.put("/socials/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const {
      platform,
      handle,
      url,
      icon_type,
      icon_value,
      sort_order,
      is_active,
    } = req.body;
    await q(
      `UPDATE social_links SET
          platform=?, handle=?, url=?, icon_type=?, icon_value=?, sort_order=?, is_active=?
        WHERE id=?`,
      [
        platform,
        handle || null,
        url,
        icon_type || "iconset",
        icon_value || null,
        num(sort_order, 0),
        btoi(is_active ?? 1),
        Number(req.params.id),
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "PUT /socials/:id");
  }
});

app.delete("/socials/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    await q("DELETE FROM social_links WHERE id=?", [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "DELETE /socials/:id");
  }
});

/* ----------------------------------------------------------------------------
 * ENDPOINT PUBLIK untuk homepage
 * --------------------------------------------------------------------------*/
app.get("/public/site", async (req, res) => {
  try {
    // Ambil logo
    const [logo] = await q(
      "SELECT url FROM logos WHERE is_primary=1 AND is_active=1 ORDER BY id DESC LIMIT 1"
    ).catch(async () => await q("SELECT url FROM logos ORDER BY id DESC LIMIT 1"));

    // Ambil nomor WhatsApp dan pesan default
    const [wa] = await q(
      "SELECT phone, whatsapp_message FROM whatsapp_numbers WHERE is_primary=1 AND is_active=1 ORDER BY id DESC LIMIT 1"
    ).catch(
      async () => await q("SELECT phone, whatsapp_message FROM whatsapp_numbers ORDER BY id DESC LIMIT 1")
    );

    const emails = await q(
      "SELECT id,label,email,is_primary,is_active FROM emails WHERE is_active=1 ORDER BY is_primary DESC, id ASC"
    );
    const addresses = await q(
      "SELECT id,label,address_line,city,province,postal_code,maps_url,is_primary,is_active FROM addresses WHERE is_active=1 ORDER BY is_primary DESC, id ASC"
    );
    const socials = await q(
      "SELECT id,platform,handle,url,icon_type,icon_value,sort_order,is_active FROM social_links WHERE is_active=1 ORDER BY sort_order ASC, id ASC"
    );

    res.json({
  logo_url: logo?.url || "",
  whatsapp_number: wa?.phone || "",
  // gunakan ?? agar pesan kosong tetap ditampilkan sesuai isi database
  whatsapp_message: wa?.whatsapp_message ?? "Pesan default",
  emails,
  addresses,
  socials,
});
  } catch (e) {
    sendDbError(res, e, "GET /public/site");
  }
});

app.get("/public/services", async (req, res) => {
  try {
    const rows = await q(
      "SELECT id,name,slug,summary,icon_type,icon_value,icon_bg,is_popular,is_active,sort_order FROM services WHERE is_active=1 ORDER BY sort_order ASC, name ASC"
    );
    res.json(rows);
  } catch (e) {
    sendDbError(res, e, "GET /public/services");
  }
});

/* ----------------------------------------------------------------------------
 * UPLOAD (admin)
 * --------------------------------------------------------------------------*/
app.post(
  "/upload",
  authenticateToken,
  adminOnly,
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    res.json({ url: `/uploads/${req.file.filename}` });
  }
);

/* ----------------------------------------------------------------------------
 * AUTH (register/login) — public
 * --------------------------------------------------------------------------*/
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Email, password, and role are required" });
  }
  try {
    const [dup] = await db
      .promise()
      .query("SELECT id FROM users WHERE email=?", [email]);
    if (dup.length)
      return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", [
        username || "",
        email,
        hashed,
        role,
      ]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    sendDbError(res, err, "POST /register");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    sendDbError(res, err, "POST /login");
  }
});

app.get("/admin", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied: Admins only" });
  res.json({ message: `Welcome, Admin ${req.user.username}!` });
});

app.get("/health", async (req, res) => {
  try {
    await q("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    sendDbError(res, e, "GET /health");
  }
});

/* ----------------------------------------------------------------------------
 * USERS (admin)
 * --------------------------------------------------------------------------*/
app.get("/users", authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await q(
      "SELECT id, username, email, role FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (e) {
    sendDbError(res, e, "GET /users");
  }
});

app.post("/users", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email, password wajib diisi" });
    }

    const dupU = await q("SELECT id FROM users WHERE username=?", [username]);
    if (dupU.length)
      return res.status(409).json({ error: "Username sudah dipakai" });
    const dupE = await q("SELECT id FROM users WHERE email=?", [email]);
    if (dupE.length)
      return res.status(409).json({ error: "Email sudah dipakai" });

    const hash = await bcrypt.hash(password, 10);
    await q(
      "INSERT INTO users (username, email, password, role) VALUES (?,?,?,?)",
      [username, email, hash, "admin"]
    );

    res.status(201).json({ message: "created" });
  } catch (e) {
    sendDbError(res, e, "POST /users");
  }
});

app.put("/users/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const sets = [];
    const vals = [];

    if (username !== undefined) {
      sets.push("username=?");
      vals.push(username);
    }
    if (email !== undefined) {
      sets.push("email=?");
      vals.push(email);
    }
    sets.push("role=?");
    vals.push("admin"); // paksa tetap admin

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      sets.push("password=?");
      vals.push(hash);
    }

    if (!sets.length)
      return res.status(400).json({ error: "Tidak ada perubahan" });

    vals.push(Number(id));
    await q(`UPDATE users SET ${sets.join(", ")} WHERE id=?`, vals);
    res.json({ message: "updated" });
  } catch (e) {
    sendDbError(res, e, "PUT /users/:id");
  }
});

app.delete("/users/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (req.user?.id === id) {
      return res
        .status(400)
        .json({ error: "Tidak boleh menghapus akun sendiri" });
    }
    await q("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "deleted" });
  } catch (e) {
    sendDbError(res, e, "DELETE /users/:id");
  }
});

/* ----------------------------------------------------------------------------
 * PASSWORD RESET (public)
 * --------------------------------------------------------------------------*/
app.post("/auth/request-reset", async (req, res) => {
  const raw = req.body?.email ?? "";
  const email = String(raw).trim().toLowerCase();
  const generic = { message: "Jika email terdaftar, link reset telah dikirim." };

  if (!email) return res.status(200).json(generic);

  try {
    const rows = await q(
      "SELECT id, email FROM users WHERE LOWER(email)=? LIMIT 1",
      [email]
    );

    if (!rows.length) return res.status(200).json(generic);
    const user = rows[0];

    await q("DELETE FROM password_reset_tokens WHERE user_id=?", [user.id]);

    const plain = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(plain).digest("hex");

    await q(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE), NOW())`,
      [user.id, tokenHash]
    );

    const link = `${process.env.APP_URL || "http://localhost:5173"
      }/reset-password?token=${plain}`;

    try {
      await sendResetEmail(user.email, link);
    } catch (mailErr) {
      console.error("[mail] FAILED =", mailErr?.message || mailErr);
    }

    return res.status(200).json(generic);
  } catch (e) {
    return sendDbError(res, e, "POST /auth/request-reset");
  }
});

app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token dan password wajib diisi" });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const rows = await q(
      "SELECT user_id FROM password_reset_tokens WHERE token_hash=? AND expires_at > NOW() LIMIT 1",
      [tokenHash]
    );

    if (!rows.length) {
      return res
        .status(400)
        .json({ error: "Token tidak valid atau sudah kedaluwarsa" });
    }

    const userId = rows[0].user_id;
    const hash = await bcrypt.hash(password, 10);

    await q("UPDATE users SET password=? WHERE id=?", [hash, userId]);
    await q("DELETE FROM password_reset_tokens WHERE user_id=?", [userId]);

    res.json({ message: "Password berhasil direset" });
  } catch (e) {
    sendDbError(res, e, "POST /auth/reset-password");
  }
});

/* ----------------------------------------------------------------------------
 * Start server
 * --------------------------------------------------------------------------*/
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});