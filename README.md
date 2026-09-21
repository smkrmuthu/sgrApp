# SGR Moulds India — Work Order & Manufacturing Workbench

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-GitHub%20Pages-2c644a?style=for-the-badge&logo=github)](https://smkrmuthu.github.io/sgrApp/)
[![Standard](https://img.shields.io/badge/SOP-SGR--MKT--02-af7c37?style=for-the-badge)](https://smkrmuthu.github.io/sgrApp/)
[![Plant](https://img.shields.io/badge/Unit-SIPCOT%20Perundurai%20TN-1a352a?style=for-the-badge)](https://smkrmuthu.github.io/sgrApp/)

A modern, high-precision industrial Work Order Creation and Manufacturing Workbench designed for **SGR Moulds India Pvt Ltd** (SIPCOT Perundurai, Tamil Nadu).

---

## 🔗 Live Interactive Prototype

Share and test the live working application directly in the browser:
👉 **[https://smkrmuthu.github.io/sgrApp/](https://smkrmuthu.github.io/sgrApp/)**

---

## 🌟 Key Capabilities

1. **Brand-Aligned Industrial UX**:
   - Palette derived from official corporate assets: Forest Greens (`#1a352a`, `#2c644a`, `#3c7f5f`), Kraft tones (`#fbf7f0`, `#e6d0ac`, `#af7c37`), and high-contrast Ink.
   - Real-time `SHIFT 1 [RUNNING]` indicator, Role Switcher (`General Manager`, `Production Planner`, `Quality Lead`, `Dispatch`), and Global Search (`/` key).

2. **Dynamic Manufacture Item Schedule**:
   - Full whiteboard data grid: `PART #`, `DESCRIPTION`, `QTY`, `UOM`, `RUN MTR`, `WEIGHT`, `CATEGORY`, `PRICE (₹)`, `TOTAL (₹)`, `REMARKS`, `CUST REF`.
   - **Inline Quick Line Add Bar**: Add new lines with instant calculation of running meters, order weight, grand totals, and pallet capacity.
   - **Full Editing**: Pencil icon to edit line items, plus duplicate and delete actions.

3. **Automated Industrial Calculators**:
   - **Running Meters**: $\text{Qty} \times \frac{\text{Length mm}}{1000}$
   - **Profile Aggregation Formulas**: Auto-groups and computes total running meters per profile (e.g. `EB 80 X 80 X 6 = 1,830 Mtr`, `EB 75 X 75 X 6 = 1,219 Mtr`).
   - **Packaging Directives**: Automatic calculation of pallet bundles ($50 \text{ Nos/Bundle} \rightarrow 60 \text{ Bundles}$) with 46" height clearance checks.

4. **Multi-Role Audit Chain**:
   - 4-stage sequential approval: `Prepared by` $\rightarrow$ `Verified by (QA)` $\rightarrow$ `GM / JMD` $\rightarrow$ `Warehouse Gate & Dispatch` with digital approval toggles and timestamps.

5. **Pixel-Perfect Print Memo (Doc Ref: `SGR-MKT-02`)**:
   - Built-in preview modal and `@media print` engine reproducing the exact physical paper sheet layout with official SGR header, checkmarks, yellow highlights, and signature lines.

---

## 🚀 Running Locally

```bash
# Clone repository
git clone https://github.com/smkrmuthu/sgrApp.git
cd sgrApp

# Serve locally
python3 -m http.server 4173
# Or using any static file server (npx serve, live-server, etc.)
```

Open `http://localhost:4173` in your browser.

---

## 📄 License & Ownership
Copyright © 2026 SGR Moulds India Pvt Ltd. All rights reserved.
