const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 1. Serve landing page for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// 2. Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// 3. Catch-all: serve React app for everything else (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Marketing website & App listening on port ${PORT}`);
});
