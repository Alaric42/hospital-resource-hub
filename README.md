# Hospital Resource Hub

A hackathon-ready web app for hospital asset, inventory, and vendor coordination. It connects **Hospital Administration**, **Vendors/Nonprofits**, and **Doctors/Nurses** in one platform.

**The app starts with no data.** All hospital inventory and analytics are populated only after a hospital administrator uploads an Excel workbook.

## Excel import (3 department tabs)

The upload workflow is based on **three specific workbook tabs**:

- **ICU** — All rows in this sheet are assigned to the ICU department.
- **General Medicine** — All rows are assigned to General Medicine.
- **Emergency** — All rows are assigned to Emergency.

The **tab name is the source of truth** for department. If a sheet has a "Department" column, it is ignored. Each tab should contain the same column structure (no Department column needed): Asset ID, Asset Name, Category, Quantity Available, Minimum Threshold, Unit Cost, Current Condition, Funding Source, Last Updated, Notes.

## Features

- **Excel upload** — Upload a workbook with exactly three tabs: ICU, General Medicine, Emergency. Template download, tab detection, preview, validation, and import. After import, a summary shows departments and record count.
- **Asset inventory** — View all imported assets with status badges (In Stock, Low Stock, Out of Stock, Needs Attention). Filter by department (ICU, General Medicine, Emergency), category, and status.
- **Staff requests** — Doctors/nurses report usage or request supplies for ICU, General Medicine, or Emergency. Admin reviews and updates status.
- **Vendor directory** — Vendors/nonprofits create profiles. Hospitals browse and search.
- **Match shortages** — Admin sees low/out-of-stock items and recommended vendors by category.
- **Analytics** — Generated only from imported data: asset count by department, status distribution, category distribution, request stats.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (charts)
- **SheetJS (xlsx)** (Excel parse/export)
- **Lucide React** (icons)
- In-memory state (no backend DB) — suitable for demo/prototype.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Role-Based Flows

1. **Role selection** — On the home page, choose Hospital Administration, Vendor/Nonprofit, or Doctor/Nurse.
2. **Hospital Administration** — Dashboard, Excel Upload, Asset Inventory, Requests & Alerts, Match Shortages, Vendor Directory, Analytics, Settings.
3. **Vendor/Nonprofit** — My Profile (create/update organization and offerings), Directory, Settings.
4. **Doctor/Nurse** — Report usage or request supplies (quick form), My Requests, Settings.

Use **Switch role** in the sidebar to change role without losing in-memory data during the session.

## Excel template

The **Download template** button on the Excel Upload page generates a workbook with three sheets: **ICU**, **General Medicine**, and **Emergency**. Each sheet has these columns (no Department column — the sheet name is the department):

- Asset ID, Asset Name, Category, Quantity Available, Minimum Threshold, Unit Cost, Current Condition, Funding Source, Last Updated, Notes

Validation will prompt if required tabs are missing or if a tab has no valid rows.

## Empty states

Before any upload, the app shows clear empty states (e.g. “No hospital data uploaded yet”, “Upload your Excel workbook to begin”) on the dashboard, inventory, analytics, match, and requests pages. No fake or seed data is shown.

---

Built for hackathon demo. Extend with a real backend and auth for production.
