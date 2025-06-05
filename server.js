const express = require('express');
const path = require('path');
const ghibliRoute = require('./routes/ghibli');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/ghibli', ghibliRoute);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
