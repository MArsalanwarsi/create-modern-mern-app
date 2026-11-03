# AGENTS.md — AI Agent Guidance for `create-modern-mern-app`

Welcome, AI Agent! This file provides everything you need to understand, maintain, test, and extend this repository without guessing.

---

## 1. Repository Overview
- **Project:** `create-modern-mern-app`
- **Type:** Node.js CLI npm package
- **Primary Goal:** Scaffolds complete full-stack MERN (MongoDB, Express, React, Node.js) applications with sliced layouts and selective libraries.
- **npm Package:** `create-modern-mern-app`
- **GitHub:** `https://github.com/MArsalanwarsi/create-modern-mern-app`
- **Primary Language:** JavaScript (ES Modules, `"type": "module"`)

---

## 2. Tech Stack & Key Files
- **CLI Framework:** `@clack/prompts` + `picocolors`
- **CLI Binary Entry:** `bin/index.js`
- **CLI Wizard Orchestrator:** `src/cli.js`
- **Generators:**
  - `src/generator/clientGenerator.js`: Scaffolds Vite + React frontend (4 variants: JS, JS+Compiler, TS, TS+Compiler; sliced layouts in `layout/slices/`; pages in `pages/website/` and `pages/dashboard/`; optional packages: Tailwind, Shadcn, Redux, Toastify; core: React Router DOM).
  - `src/generator/serverGenerator.js`: Scaffolds Express + MongoDB backend (ESM or TypeScript; `src/config/db`, `src/models/`, `src/controllers/`, `src/routes/`, `src/middlewares/`, `src/utils/`, `.env.example`; optional add-ons: CORS, Multer, Cloudinary, Nodemailer, dotenv).
  - `src/generator/rootGenerator.js`: Scaffolds root `package.json` with concurrent dev scripts, `.gitignore`, and `README.md`.
  - `src/generator/installer.js`: Cross-platform child-process runner for `npm install`.
- **Utilities:**
  - `src/utils/naming.js`: Sanitizes package names and checks directory collisions.
  - `src/utils/fs-helpers.js`: Recursive directory and file tree creation.

---

## 3. Testing & Verification Rules
- **Test Command:**
  ```bash
  npm test
  # Or: node --test test/*.test.js
  ```
- **Test Engine:** Built-in Node.js test runner (`node:test`, `node:assert`).
- **Rule:** Never modify generator logic without running `npm test`. All 9 tests must pass before committing.

---

## 4. Key Architectural Constraints & Invariants
1. **React Router DOM is Required:** Do not remove React Router DOM from the client templates. The sliced layout architecture (`WebsiteLayout` and `DashboardLayout`) relies on `<Outlet />`.
2. **NodeNext TypeScript ESM Import Extensions:** In `serverGenerator.js`, when generating TypeScript server files under `"moduleResolution": "NodeNext"`, relative imports MUST end with `.js` (e.g. `import { connectDB } from './config/db.js';`).
3. **Cross-Platform Paths:** Never hardcode backslashes (`\`) into generated import statements. Always use forward slashes (`/`).
4. **Conditional Package Safety:** If an add-on is deselected (e.g., Cloudinary or Multer), its imports and route registrations must be completely omitted from the generated project.

---

## 5. How to Release Updates
Push tested changes to main. The publish.yml workflow runs the release checks, increments the patch version, pushes a release commit and tag, and publishes to npm. See the automatic npm releases section in README.md for authentication and recovery.
