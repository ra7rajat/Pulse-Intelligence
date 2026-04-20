# 🏟️ PulseStadium: Tactical Venue Intelligence OSS
[![Project Status: Production](https://img.shields.io/badge/Status-Production--Hardened-emerald?style=for-the-badge)](https://github.com/ra7rajat/Pulse-Intelligence)
[![Security: Zero-Trust](https://img.shields.io/badge/Security-Zero--Trust-indigo?style=for-the-badge)](https://github.com/ra7rajat/Pulse-Intelligence)
[![Architecture: Digital Twin](https://img.shields.io/badge/Arch-Digital--Twin-blue?style=for-the-badge)](https://github.com/ra7rajat/Pulse-Intelligence)

**PulseStadium** is an elite, production-grade tactical Digital Twin orchestrator designed for high-density venue safety. Built specifically for the M. Chinnaswamy Stadium, it leverages real-time neural flow analytics, WebGL-accelerated 3D rendering, and agentic playbook logic to manage crowd dynamics with absolute precision.

---

## 🏛️ System Architecture
```mermaid
graph TD
    A[Next.js 15 App] --> B[Edge Security Middleware]
    B --> C[Tactical Canvas Rendering]
    C --> D[WebGL Google Maps API]
    A --> E[FastAPI Intelligence Engine]
    E --> F[Vertex AI: Gemini 1.5 Flash]
    E --> G[Firebase: Firestore Realtime]
    F --> H[Agentic Playbook Generation]
```

## 💎 Core Engineering Pillars
*   **Tactical Digital Twin**: A high-fidelity 3D visualization of the M. Chinnaswamy Stadium utilizing the **Google Maps WebGL Vector API** for frame-perfect spatial tracking.
*   **Agentic Intelligence**: Integrated **Vertex AI** orchestrator that generates dynamic "Playbooks" for security and medical deployments based on real-time stress index telemetry.
*   **Zero-Trust Hardening**: Hardened with strict **CSP policies**, environment validation, and an orchestrator-level logger with automated secret redaction.
*   **Enterprise Accessibility**: Built to **WCAG 2.2 AAA** standards, featuring color-independent crowd density indicators and synchronized ARIA live regions for tactical HUD updates.

## 🛠️ Technology Stack
- **Frontend**: Next.js 15 (Standalone), Framer Motion, Lucide, Tailwind 4.
- **Backend**: FastAPI, Python 3.11, Pydantic v2.
- **Infrastructure**: Google Cloud Run, Cloud Build, Firebase.
- **AI/ML**: Vertex AI (Gemini Flash), Neural-Flow predictive models.

## 🚀 Quick Start
For full deployment instructions, environment variables, and operational guides, please refer to the **[User Guide](USER_GUIDE.md)**.

---
*Developed for elite venue safety orchestration at scale.*

