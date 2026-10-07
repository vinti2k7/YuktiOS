
# YuktiOS - Enterprise Multi-Agent Operating System for SMEs

YuktiOS is an autonomous Multi-Agent Operating System designed specifically for Small & Medium Enterprises (SMEs). It unifies six specialized domain agents on a central event-driven orchestration bus to automate operations, predict inventory demand, optimize cash flow, manage statutory compliance, and streamline customer engagement with zero manual friction.

---

## 🤖 Specialized Domain Agents

1. **Finance Agent**: GST-compliant B2B invoicing (18% tax calculation), expense recording, and 30–90 day predictive cash flow forecasting.
2. **Inventory Agent**: SKU catalog management, dynamic stockout risk scoring, 30-day demand velocity modeling, and automated purchase order recommendations.
3. **HR & Payroll Agent**: Biometric punch attendance tracking, statutory employee deductions (12% EPF + 0.75% ESI), and 1-click batch payroll disbursals.
4. **Marketing Agent**: RFM customer segmentation (Recency, Frequency, Monetary), churn risk calculation, and AI-assisted multi-channel campaign dispatch (WhatsApp, Email, SMS).
5. **Customer Support Agent**: Semantic vector retrieval against indexed FAQ knowledge base, support ticket triage, and automated empathetic reply drafting.
6. **Central Orchestrator & Analytics**: Cross-domain event consensus loop (Observe → Analyze → Recommend → Act) coordinating multi-agent workflows.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vinti2k7/YuktiOS.git
   cd YuktiOS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional for live Gemini AI features):
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
   *(If no API key is provided, YuktiOS gracefully operates in deterministic rule-based mode).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Build & Production Deployment

To create an optimized production build:
```bash
npm run build
npm start
```

---

## 📄 License
This project is proprietary software for YuktiOS Enterprise.
