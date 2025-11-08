// app.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

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
const API_KEY = "AIzaSyCtQv0p4RP4eLrl1N7_vR8dw2pjI1Xs7kw";
if (!API_KEY) {
  console.error("❌ Chưa có API_KEY trong file .env!");
  process.exit(1);
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

export default app;