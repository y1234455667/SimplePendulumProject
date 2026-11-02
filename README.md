# SimplePendulumProject
Teammates: Shashwat Verma, Atharv Garg, Aryan Harsh, Pramukh Bhardwaj. 

# Simple Pendulum Simulation Engine (C++ RK4 & Full-Stack Web Visualizer)

An interactive, full-stack physics simulation of a simple pendulum. Instead of relying on standard browser-side JavaScript approximations, this project executes a compiled **C++ physics engine** implementing the **4th-Order Runge-Kutta (RK4)** numerical integration method on the backend, bridged to an HTML5 Canvas dark-mode visualizer via a **Node.js / Express** server.

## Access Links
* **Live Online Web App:** [https://simplependulumengineonline.onrender.com](https://simplependulumengineonline.onrender.com)
* **Local Development Server:** `http://localhost:3000` *(or `http://127.0.0.1:3000`)*

---

## System Architecture
1. **Frontend Dashboard (`index.html`, `style.css`, `script.js`):** Captures real-time slider inputs for string length ($0.1\text{ m}$ to $4.0\text{ m}$) and initial release angle ($-20.0^\circ$ to $20.0^\circ$), rendering a 60 FPS canvas animation alongside live telemetry readouts ($\theta$, $\omega$, and $t$) and cycle-by-cycle period tracking.
2. **Backend Bridge (`server.js`):** A Node.js Express server that listens for parameter updates via `POST /run-simulation` and executes the compiled C++ binary (`engine.exe` on Windows / `engine` on Linux) as a child process.
3. **Core C++ Physics Engine (`main.cpp`):** Converts input angles from degrees to radians, solves the differential equation $\frac{d^2\theta}{dt^2} = -\frac{g}{L}\sin(\theta)$ using the 4th-Order Runge-Kutta (RK4) integrator, and outputs time-series Cartesian coordinates to `angles.csv`.

---

## How to Build & Run Locally

### Prerequisites
* **C++ Compiler:** `g++` (MinGW-w64 on Windows or GCC on Linux/macOS)
* **Node.js Runtime:** v18+ ([Download here](https://nodejs.org/))

### Step-by-Step Setup
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_NEW_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_NEW_REPO_NAME.git)
   cd YOUR_NEW_REPO_NAME
