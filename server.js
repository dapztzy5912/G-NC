const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/convert', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

  try {
    const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/ghibli?imageUrl=${encodeURIComponent(imageUrl)}&type=png`;
    const response = await fetch(apiUrl);
    const buffer = await response.buffer();
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    res.json({ image: base64Image });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from API' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
