const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Hanya terima file gambar
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'));
    }
  }
});

app.use(express.static("public"));

// Error handler untuk multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File terlalu besar (max 10MB)' });
    }
  }
  next(error);
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }

    const file = fs.createReadStream(req.file.path);
    const form = new FormData();
    form.append("file", file, req.file.originalname);

    // Upload ke 0x0.st (gratis, tanpa API key)
    const response = await axios.post("https://0x0.st", form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'GhibliAI/1.0'
      },
      timeout: 30000 // 30 detik timeout
    });

    // Hapus file lokal setelah upload
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.warn('Gagal menghapus file temporary:', unlinkError.message);
    }

    res.json({ url: response.data.trim() });
  } catch (error) {
    console.error('Upload error:', error.message);
    
    // Bersihkan file temporary jika ada error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.warn('Gagal menghapus file temporary:', unlinkError.message);
      }
    }

    if (error.code === 'ECONNABORTED') {
      res.status(500).json({ error: "Timeout saat upload gambar" });
    } else if (error.response) {
      res.status(500).json({ error: "Gagal upload ke server eksternal" });
    } else {
      res.status(500).json({ error: "Gagal upload gambar" });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
