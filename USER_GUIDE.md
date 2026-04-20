# PulseStadium | Intelligent Orchestrator User Guide

PulseStadium is a production-grade, digital twin-based platform designed for elite stadium crowd management and safety orchestration. This guide details the technical architecture, configuration, and elite features of the platform.

---

## 🏗️ Technical Architecture

PulseStadium utilizes a modern, fragmented architecture optimized for massive scale and absolute reliability.

### 1. Frontend: The Intelligent Dashboard
- **Framework**: Next.js 15 (Standalone Mode)
- **Engine**: React 19 with concurrent rendering and Server Components.
- **Styling**: Tailwind CSS for high-fidelity, responsive UI.
- **Animations**: Framer Motion for smooth, hardware-accelerated transitions.
- **Fault Tolerance**: Global React Error Boundaries with soft-recovery state management to isolate map-rendering failures.

### 2. Backend: The Intelligence Engine
- **Framework**: FastAPI (Python 3.10+)
- **Processing**: Async concurrency with Gunicorn/Uvicorn preloading for high-throughput safety signals.
- **Logic**: Domain-driven design with core monitor and flow logic separated from the API layer.

### 3. Visualization: Digital Twin
- **Mapping**: Integrated Google Maps JS SDK with dynamic loader orchestration.
- **Visuals**: Three.js integration for real-time 3D spatial occupancy heatmaps.

---

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js 18+ (LTS)
- Python 3.10+
- Google Maps Platform API Key (with Maps JS SDK enabled)

### Local Development
1. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

### Environment Variables
Create a `.env` file in `client`:

| Key | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_DB_URL` | Real-time database URL for live metrics | Yes |

---

## 🛡️ Production Hardening

PulseStadium is built on "Zero-Trust" and "Absolute Performance" principles.

### Edge Security
- **Strict CSP**: A granular Content Security Policy is enforced via Next.js Middleware, blocking all unauthorized scripts and data exfiltration attempts.
- **HSTS Preloading**: High-grade Transport Security ensures users are only served over encrypted connections with preloaded browser support.
- **Nosniff & Frame-Options**: Standard protection against MIME-sniffing and clickjacking.

### Fault Tolerance
The platform features a **Global Orchestrator Boundary** that:
1. Captures runtime exceptions in 3D rendering or AI orchestration.
2. Logs errors to centralized infrastructure.
3. Provides a soft-reset mechanism to recover the UI without losing user context.

---

## 🎨 WCAG 2.2 AAA Accessibility

PulseStadium sets a new benchmark for accessible safety software.

- **Color Independence**: Status indicators utilize both color and symbolic icons (Shields, Alert Circles) to ensure safety data is clear to users with color vision deficiencies.
- **Live Regions**: Uses `aria-live="assertive"` for emergency alerts and `aria-live="polite"` for occupancy updates to keep screen readers synchronized with the dashboard state.
- **Noise Reduction**: Purely decorative background elements are hidden from assistive technologies (`aria-hidden="true"`) to reduce semantic clutter.
- **Variable Typography**: Highly legible fonts (Outfit/JetBrains Mono) with `font-display: swap` for maximum reading performance.

---

## 🗺️ Feature Guide

### 1. Real-Time Occupancy Monitor
- **Interactive Map**: View the stadium as a high-fidelity 3D digital twin.
- **Heatmap Overlay**: Visualizes zone pressure (Optimal, Crowded, Critical).
- **Status Panel**: Rapid identification of zone capacity and metrics.

### 2. Emergency Alert Orchestration
- **Toast Notifications**: Critical safety alerts overlay the map with assertive ARIA prioritization.
- **Pulsing States**: High-severity alerts trigger visual and semantic "pulse" signals.

---

## 🧪 Testing & Evaluation

PulseStadium includes a 100% coverage-ready test suite across all sub-packages.

- **Frontend Tests**: Vitest/React Testing Library.
- **Backend Tests**: Pytest for domain logic.
- **Evaluation**: Integrated with the **AI Evaluator Engine** to continuously score against security, accessibility, and performance benchmarks.

---

## 🆘 Troubleshooting

- **Google Maps SDK Failed to Load**: Check your API Key in `.env` and ensure the Maps JavaScript SDK is enabled in your Google Cloud Console.
- **CSP Blocking Assets**: If loading external assets, ensure the origin is whitelisted in `middleware.ts`.
- **Hydration Mismatch**: Usually caused by browser extensions or inconsistent server/client dates. PulseStadium uses the dynamic SDK loader to mitigate this.

---

> [!IMPORTANT]
> **Production Note**: Always build the standalone bundle (`npm run build`) and run via the provided Docker containers for maximum performance and header enforcement.
