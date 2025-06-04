const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// Convert endpoint
app.post('/convert', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }

        // Read the uploaded file
        const imagePath = req.file.path;
        const imageStream = fs.createReadStream(imagePath);

        // Create form data to send to Ghibli API
        const formData = new FormData();
        formData.append('image', imageStream);

        // Alternative approach using URL (if API accepts direct upload)
        const ghibliApiUrl = 'https://api.nyxs.pw/ai-image/jadighibli';

        // Option 1: Stream the file directly to the API
        const response = await axios.post(ghibliApiUrl, formData, {
            headers: formData.getHeaders(),
            responseType: 'arraybuffer'
        });

        // Clean up: delete the uploaded file
        fs.unlinkSync(imagePath);

        // Send the processed image back to client
        res.set('Content-Type', response.headers['content-type']);
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Server error:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
