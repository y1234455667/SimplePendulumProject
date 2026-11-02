const express = require('express');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html, style.css, script.js, angles.csv

// API endpoint triggered when the user adjusts sliders
app.post('/run-simulation', (req, res) => {
    const { length, angle } = req.body;

    // Path to your compiled C++ binary (engine.exe)
    const exePath = path.join(__dirname, 'engine.exe');

    // Run engine.exe with length and angle as command-line arguments
    execFile(exePath, [String(length), String(angle)], (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error.message}`);
            return res.status(500).json({ error: "Failed to run engine.exe" });
        }
        // Let the frontend know angles.csv is freshly updated
        res.json({ success: true });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running! Open http://127.0.0.1:${PORT} in your browser.`);
});