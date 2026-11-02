const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

const lengthSlider = document.getElementById('lengthSlider');
const angleSlider = document.getElementById('angleSlider');
const lengthVal = document.getElementById('lengthVal');
const angleVal = document.getElementById('angleVal');

const timeVal = document.getElementById('timeVal');
const currentAngleVal = document.getElementById('currentAngleVal');
const omegaVal = document.getElementById('omegaVal');
const periodList = document.getElementById('periodList');

const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

let trajectory = [];
let currentIndex = 0;
let isPlaying = true;
let isUpdating = false;

// Render a specific frame instantly (even when paused)
function renderFrame(index) {
    if (trajectory.length === 0) return;
    const frame = trajectory[index];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originX = canvas.width / 2;
    const originY = 40;
    const scale = 85; 

    const bobX = originX + (frame.x * scale);
    const bobY = originY + (frame.y * scale);

    // Reference equilibrium line
    ctx.beginPath();
    ctx.setLineDash([4, 6]);
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, canvas.height - 20);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Ceiling mount bar
    ctx.beginPath();
    ctx.moveTo(originX - 40, originY);
    ctx.lineTo(originX + 40, originY);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Pendulum string
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pivot pin
    ctx.beginPath();
    ctx.arc(originX, originY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff3366';
    ctx.fill();

    // Smaller, light neon red glowing pendulum bob
    ctx.beginPath();
    ctx.arc(bobX, bobY, 11, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff6688';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Update live telemetry
    timeVal.textContent = frame.time.toFixed(2) + " s";
    currentAngleVal.textContent = (frame.theta * (180 / Math.PI)).toFixed(2) + "°";
    omegaVal.textContent = frame.omega.toFixed(3) + " rad/s";
}

// Analyze trajectory to find oscillation periods (to-and-fro cycle timing)
function calculatePeriods(data) {
    periodList.innerHTML = '';
    let zeroCrossings = [];

    // Detect direction changes / zero crossings in theta
    for (let i = 1; i < data.length; i++) {
        if (data[i-1].theta * data[i].theta < 0) {
            zeroCrossings.catches = zeroCrossings.push(data[i].time);
        }
    }

    // Every 2 zero crossings in the same direction represents a full to-and-fro cycle
    let cycles = [];
    for (let i = 2; i < zeroCrossings.length; i += 2) {
        let cycleDuration = zeroCrossings[i] - zeroCrossings[i-2];
        cycles.push(cycleDuration);
    }

    if (cycles.length === 0) {
        periodList.innerHTML = `<span class="placeholder-text">Amplitude too small for full cycle completion</span>`;
        return;
    }

    cycles.forEach((period, idx) => {
        const badge = document.createElement('div');
        badge.className = 'period-badge';
        badge.textContent = `Cycle ${idx + 1}: ${period.toFixed(3)}s`;
        periodList.appendChild(badge);
    });
}

async function triggerSimulation() {
    if (isUpdating) return;
    isUpdating = true;

    const length = lengthSlider.value;
    const angle = angleSlider.value;

    try {
        const response = await fetch('/run-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ length, angle })
        });

        if (response.ok) {
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
            currentIndex = 0;
            calculatePeriods(trajectory);
            renderFrame(currentIndex);
        }
    } catch (err) {
        console.error("Error communicating with C++ backend:", err);
    }
    isUpdating = false;
}

lengthSlider.addEventListener('input', (e) => {
    lengthVal.textContent = parseFloat(e.target.value).toFixed(1);
    triggerSimulation();
});

angleSlider.addEventListener('input', (e) => {
    angleVal.textContent = parseFloat(e.target.value).toFixed(1);
    triggerSimulation();
});

playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? 'Pause' : 'Play';
});

// Restart swing works instantly whether playing or paused
resetBtn.addEventListener('click', () => {
    currentIndex = 0;
    renderFrame(currentIndex);
});

function animate() {
    if (isPlaying && trajectory.length > 0) {
        renderFrame(currentIndex);
        currentIndex = (currentIndex + 1) % trajectory.length;
    }

    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 16);
}

triggerSimulation().then(() => {
    animate();
});