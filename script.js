const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Slider elements
const lengthSlider = document.getElementById('lengthSlider');
const angleSlider = document.getElementById('angleSlider');
const lengthVal = document.getElementById('lengthVal');
const angleVal = document.getElementById('angleVal');

// Telemetry elements
const timeVal = document.getElementById('timeVal');
const currentAngleVal = document.getElementById('currentAngleVal');
const omegaVal = document.getElementById('omegaVal');

// Button elements
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

let trajectory = [];
let currentIndex = 0;
let isPlaying = true;
let isUpdating = false;

// Trigger C++ backend calculation via Node.js server
async function triggerSimulation() {
    if (isUpdating) return;
    isUpdating = true;

    const length = lengthSlider.value;
    const angle = angleSlider.value;

    try {
        // 1. Tell Node.js to execute engine.exe with new slider parameters
        const response = await fetch('/run-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ length, angle })
        });

        if (response.ok) {
            // 2. Fetch the freshly generated angles.csv (with timestamp to prevent browser caching)
            const csvResponse = await fetch('/angles.csv?t=' + Date.now());
            const csvText = await csvResponse.text();
            
            const newTrajectory = [];
            const rows = csvText.trim().split('\n');
            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(',');
                if (cols.length >= 5) {
                    newTrajectory.push({
                        time: parseFloat(cols[0]),
                        theta: parseFloat(cols[1]),
                        omega: parseFloat(cols[2]),
                        x: parseFloat(cols[3]),
                        y: parseFloat(cols[4])
                    });
                }
            }
            trajectory = newTrajectory;
            currentIndex = 0; // Restart swing with new data
        }
    } catch (err) {
        console.error("Error communicating with C++ backend:", err);
    }
    isUpdating = false;
}

// Slider event listeners
lengthSlider.addEventListener('input', (e) => {
    lengthVal.textContent = parseFloat(e.target.value).toFixed(1);
    triggerSimulation();
});

angleSlider.addEventListener('input', (e) => {
    angleVal.textContent = parseFloat(e.target.value).toFixed(1);
    triggerSimulation();
});

// Button event listeners
playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? 'Pause' : 'Play';
});

resetBtn.addEventListener('click', () => {
    currentIndex = 0;
});

// Canvas Rendering Loop
function animate() {
    if (isPlaying && trajectory.length > 0) {
        const frame = trajectory[currentIndex];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const originX = canvas.width / 2;
        const originY = 50;
        const scale = 95; // 95 pixels per meter (4.0m * 95 + 50 = 430px, fits inside 500px height)

        // Since C++ now outputs positive y = L * cos(angle), bobY hangs downwards from originY
        const bobX = originX + (frame.x * scale);
        const bobY = originY + (frame.y * scale);

        // Draw subtle background reference grid line (equilibrium line)
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX, canvas.height - 20);
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw ceiling mount bar
        ctx.beginPath();
        ctx.moveTo(originX - 40, originY);
        ctx.lineTo(originX + 40, originY);
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw pendulum string
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw pivot pin
        ctx.beginPath();
        ctx.arc(originX, originY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1';
        ctx.fill();

        // Draw glowing pendulum bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#818cf8';
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Update live telemetry cards
        timeVal.textContent = frame.time.toFixed(2) + " s";
        currentAngleVal.textContent = (frame.theta * (180 / Math.PI)).toFixed(2) + "°";
        omegaVal.textContent = frame.omega.toFixed(3) + " rad/s";

        currentIndex = (currentIndex + 1) % trajectory.length;
    }

    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 16);
}

// Run initial simulation on load and start animation loop
triggerSimulation().then(() => {
    animate();
});