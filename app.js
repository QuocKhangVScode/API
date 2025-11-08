// app.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ Cấu hình bảo mật & CORS
app.use(helmet());

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

app.use(cors({
  origin: [
    allowedOrigin,
    "http://lockchildkeeper.asia",
    "https://lockchildkeeper.asia"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Cho phép đọc JSON trong body
app.use(express.json());

// ✅ Cho phép truy cập file HTML/CSS/JS trong cùng thư mục
app.use(express.static("."));

// ✅ Giới hạn số lượng request (tránh spam)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 60,             // tối đa 60 request/phút
});
app.use(limiter);

// ✅ Lấy API key từ .env
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // ✅ CHỈ console.error, KHÔNG process.exit(1)
  console.error("❌ Chưa có API_KEY. Vui lòng cấu hình trên Vercel Dashboard!");
}

// ✅ URL đến Gemini API
const MODEL_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

// ✅ Endpoint cho frontend gọi
app.post("/analyze", async (req, res) => {
  try {
    console.log("📩 Nhận request từ client:", req.body);

    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log("🔹 Phản hồi từ Gemini:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error("❌ Lỗi proxy:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

module.exports = app;