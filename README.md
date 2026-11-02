# SimplePendulumProject
Teammates: Shashwat Verma, Atharv Garg, Aryan Harsh, Pramukh Bhardwaj. 

# Simple Pendulum Simulation Engine (C++ RK4 & Full-Stack Web Visualizer)

An interactive, full-stack physics simulation of a simple pendulum. Instead of relying on standard browser-side JavaScript approximations, this project executes a compiled **C++ physics engine** implementing the **4th-Order Runge-Kutta (RK4)** numerical integration method on the backend, bridged to an HTML5 Canvas dark-mode visualizer via a **Node.js / Express** server[cite: 1, 4, 9].

## Access Links
* **Live Online Web App:** [https://simplependulumengineonline.onrender.com](https://simplependulumengineonline.onrender.com)[cite: 9]
* **Local Development Server:** `http://localhost:3000` *(or `http://127.0.0.1:3000`)*[cite: 4, 5, 6]

---

## Technology Stack & Languages Used
* **Core Physics Engine:** C++ (compiled with `-O3` optimization for high computational performance)[cite: 4]
* **Backend Server:** Node.js, Express.js (handles HTTP routing, environment detection, and child-process execution)[cite: 4, 6]
* **Frontend Interface:** HTML5 Canvas, CSS3 (Custom dark-mode UI with neon red accents and real-time telemetry cards)[cite: 1, 4]
* **Data Interchange Format:** CSV (Comma-Separated Values for efficient time-series coordinate streaming)[cite: 1, 4]

---

## Algorithm & Mathematical Model

### 1. The Physical Model
The motion of an idealized simple pendulum of length $L$ under acceleration due to gravity $g$ is governed by the non-linear second-order ordinary differential equation (ODE):
$$\frac{d^2\theta}{dt^2} = -\frac{g}{L}\sin(\theta)$$

### 2. 4th-Order Runge-Kutta (RK4) Numerical Method
To solve this non-linear differential equation with high numerical stability and minimal truncation error, the second-order system is decoupled into a system of two first-order ODEs:
* $\frac{d\theta}{dt} = \omega$ (Angular velocity)
* $\frac{d\omega}{dt} = -\frac{g}{L}\sin(\theta)$ (Angular acceleration)

The **RK4 algorithm** evaluates four weighted incremental slopes ($k_1, k_2, k_3, k_4$) over each discrete time step $dt$:
$$\theta_{n+1} = \theta_n + \frac{1}{6}(k_{1\theta} + 2k_{2\theta} + 2k_{3\theta} + k_{4\theta})$$
This yields an error bound of $O(dt^4)$, providing an exceptionally accurate trajectory profile even across extended oscillation cycles and wider angles (up to $\pm 20^\circ$).

### 3. Cycle Period Tracking Algorithm
The client-side script parses the generated time-series data points to detect zero-crossings where the angular displacement or velocity changes sign, computing the exact elapsed time between matching turning points to dynamically log individual to-and-fro period durations.

---

## System Architecture & Workflow
1. **Frontend Dashboard (`index.html`, `style.css`, `script.js`):** Captures user inputs for string length ($0.1\text{ m}$ to $4.0\text{ m}$) and initial release angle ($-20.0^\circ$ to $20.0^\circ$), rendering a 60 FPS HTML5 Canvas animation[cite: 1, 4].
2. **Backend Bridge (`server.js`):** Listens for parameters via `POST /run-simulation`, detects the host environment (Windows vs. Linux), and executes the compiled binary (`engine.exe` or `./engine`) safely[cite: 3, 4, 6].
3. **Data Pipeline:** The C++ engine computes the trajectory loop, outputs the Cartesian coordinates to `angles.csv`, which is fetched and rendered instantly by the web interface[cite: 1, 4].
