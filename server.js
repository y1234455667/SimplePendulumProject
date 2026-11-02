const express = require('express');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/run-simulation', (req, res) => {
    const { length, angle } = req.body;

    // Uses 'engine.exe' on your Windows laptop, and 'engine' on Render's Linux server
    const binaryName = process.platform === 'win32' ? 'engine.exe' : 'engine';
    const exePath = path.join(__dirname, binaryName);

    execFile(exePath, [String(length), String(angle)], (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error.message}`);
            return res.status(500).json({ error: "Failed to run physics engine binary" });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});