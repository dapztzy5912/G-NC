const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = fs.createReadStream(req.file.path);
    const form = new FormData();
    form.append("file", file, req.file.originalname);

    // Upload ke 0x0.st (gratis, tanpa API key)
    const response = await axios.post("https://0x0.st", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(req.file.path); // hapus file lokal
    res.json({ url: response.data.trim() }); // URL hasil upload
  } catch (error) {
    res.status(500).json({ error: "Gagal upload gambar" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
