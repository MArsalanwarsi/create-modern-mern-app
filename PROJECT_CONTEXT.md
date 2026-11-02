# Project Context & Architecture: `create-modern-mern-app`

> **Note for AI Models / Developers:**  
> This document contains the complete context, architectural specifications, prompt flow, folder structures, and implementation history for the `create-modern-mern-app` CLI package.

---

## 1. Project Identity & Metadata
- **Package Name:** `create-modern-mern-app`
- **Version:** `1.0.0`
- **npm Registry URL:** [https://www.npmjs.com/package/create-modern-mern-app](https://www.npmjs.com/package/create-modern-mern-app)
- **GitHub Repository:** [https://github.com/MArsalanwarsi/create-modern-mern-app](https://github.com/MArsalanwarsi/create-modern-mern-app)
- **Author:** Muhammad Arsalan Warsi
- **License:** MIT
- **Executable Command:** `npx create-modern-mern-app@latest [project-name]` or `npm create modern-mern-app@latest [project-name]`
- **Runtime Requirement:** Node.js `>=18.11.0`

---

## 2. Core Purpose & Value Proposition
`create-modern-mern-app` is an interactive command-line interface (CLI) tool published to npm that automates scaffolding full-stack **MERN (MongoDB, Express, React, Node.js)** applications in seconds.

Instead of generic starter code, it provides:
1. Vite-powered React frontend supporting modern variants (including React 19 Compiler).
2. Sliced layout architecture (`Navbar`, `Sidebar`, `Footer`, `Header`) dividing the app into public `website` pages and admin `dashboard` pages.
3. Express + MongoDB backend with proper separation of concerns (models, controllers, routes, config, middlewares, utils) supporting native JavaScript ES Modules or TypeScript.
4. Granular multi-select choices for popular libraries with zero dead code or broken imports.

---

## 3. Interactive CLI Prompts (Built with `@clack/prompts` & `picocolors`)

When a developer runs `npx create-modern-mern-app@latest`, they go through this guided wizard:

1. **Project Name:**
   - Validates non-empty input.
   - Performs inline collision detection: checks if the target folder exists and is non-empty.
   - Sanitizes the name for npm package rules (handles `@scope/`, dots, spaces, uppercase).
2. **Frontend Variant Selection (Vite Style):**
   - `JavaScript` (Vite + React)
   - `JavaScript + React Compiler` (React 19 Compiler babel plugin)
   - `TypeScript` (Vite + React TS)
   - `TypeScript + React Compiler` (TypeScript + React 19 Compiler)
3. **Frontend Packages (Multi-Select):**
   - `Tailwind CSS` (Configured with PostCSS & autoprefixer)
   - `Shadcn UI` (Auto-includes Tailwind, `components.json`, `src/lib/utils`, and sample `Button`)
   - `Redux Toolkit` (Configured `src/store/index` and `src/store/slices/counterSlice`)
   - `React-Toastify` (Configured with `<ToastContainer />` pre-mounted)
   *(React Router DOM v7 is built-in as a non-optional core dependency to power nested layouts).*
4. **Backend Language Selection:**
   - `JavaScript (ES Modules)` (Native Node.js `"type": "module"`, running via `node --watch`)
   - `TypeScript` (Configured with `tsconfig.json`, `tsx watch` dev runner, and Express `@types/*`)
5. **Backend Add-ons (Multi-Select with Express + MongoDB/Mongoose core):**
   - `CORS` (Cross-Origin Resource Sharing middleware)
   - `dotenv` (Environment variable management)
   - `Multer` (Disk storage file uploads)
   - `Cloudinary` (Cloud media storage setup)
   - `Nodemailer` (SMTP email transport and helper)
6. **Dependency Installation Option:**
   - Asks whether to run `npm install` automatically in root, client, and server, or output manual setup instructions.

---

## 4. Scaffolded Project Folder Structure

```
<project-name>/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Atomic UI components (Card, Button)
│   │   │   └── ui/             # Shadcn primitives (if selected)
│   │   ├── layout/             # Sliced layout architecture
│   │   │   ├── slices/         # Sliced partials: Navbar, Sidebar, Footer, Header
│   │   │   ├── WebsiteLayout   # Public layout wrapper (<Outlet />)
│   │   │   └── DashboardLayout # Admin dashboard layout wrapper (<Outlet />)
│   │   ├── pages/              # Application pages
│   │   │   ├── website/        # Home, About, Contact
│   │   │   └── dashboard/      # Overview, Settings
│   │   ├── store/              # Redux Toolkit store & slices (if selected)
│   │   ├── lib/                # Shadcn cn() helper (if selected)
│   │   ├── App                 # Pre-wired React Router DOM nested routes
│   │   ├── main                # React DOM root entry
│   │   └── index.css           # Global CSS & Tailwind directives
│   ├── index.html
│   ├── package.json
│   └── vite.config.js|ts
│
├── server/                     # Express + MongoDB Backend
│   ├── src/
│   │   ├── config/             # DB (db.js|ts) & Cloudinary config
│   │   ├── controllers/        # Route controllers (api.controller.js|ts)
│   │   ├── models/             # Mongoose schemas (user.model.js|ts)
│   │   ├── routes/             # Express route definitions (api.routes.js|ts)
│   │   ├── middlewares/        # Error handlers & Multer upload middleware
│   │   ├── utils/              # Email delivery helpers (nodemailer.js|ts)
│   │   └── index.js|ts         # Express server bootstrap & MongoDB connect
│   ├── .env.example            # Pre-configured environment variable placeholders
│   ├── package.json
│   └── tsconfig.json           # (If TypeScript selected)
│
├── package.json                # Root concurrent scripts
└── README.md                   # Full setup instructions
```

### Root Scripts in Generated Projects:
- `npm run dev`: Runs client (`localhost:3000`) and server (`localhost:5000`) concurrently.
- `npm run dev:client`: Runs Vite frontend dev server.
- `npm run dev:server`: Runs Express backend with live reload (`--watch` or `tsx watch`).
- `npm run build`: Builds both client and server for production.
- `npm run install:all`: Installs all dependencies across root, client, and server.

---

## 5. CLI Internal Codebase Architecture

The CLI tool itself is located in `c:\Users\arsalan\Desktop\Complete Npm package`:

```
├── bin/
│   └── index.js                         # Executable CLI binary entry (#!/usr/bin/env node)
├── src/
│   ├── cli.js                           # Prompt orchestration with @clack/prompts
│   ├── generator/
│   │   ├── clientGenerator.js           # Client generator: variants, layouts, optional packages
│   │   ├── serverGenerator.js           # Server generator: ESM vs TS, MongoDB, controllers, add-ons
│   │   ├── rootGenerator.js             # Root package.json, gitignore, and README generator
│   │   └── installer.js                 # Cross-platform child-process npm install runner
│   └── utils/
│       ├── naming.js                    # Package name sanitization and directory collision checks
│       └── fs-helpers.js                # Recursive directory creation and file writing
├── test/
│   ├── clientGenerator.test.js          # Tests for client layout, variants, and packages
│   ├── serverGenerator.test.js          # Tests for server ESM/TS, routes, and add-ons
│   ├── rootGenerator.test.js            # Tests for root scripts and manifests
│   ├── naming.test.js                   # Tests for sanitization and directory validation
│   └── e2e.test.js                      # End-to-end fullstack scaffolding test
├── package.json                         # Configured with "bin", "files", and "engines"
└── README.md                            # Package documentation for npm and GitHub
```

---

## 6. Engineering History & Key Decisions
1. **React Router DOM as Core Dependency:**  
   Because the user requested separate public website pages (`Home`, `About`, `Contact`) and admin dashboard pages (`Overview`, `Settings`) with sliced layouts (`Navbar`, `Sidebar`, `Footer`, `Header`), React Router DOM was made a required core dependency on the client to avoid broken navigation or dead code.
2. **Express + MongoDB as Core Backend:**  
   Express and MongoDB/Mongoose form the foundational architecture of the backend, while CORS, Multer, Cloudinary, and Nodemailer are modular add-ons.
3. **Automated TDD Test Suite:**  
   9 tests across 5 test suites run via Node.js native test runner (`node --test test/*.test.js`).
4. **Code Review Refinements:**
   - Fixed a fatal `SyntaxError` in `vite.config` caused by leading comma interpolation when React Compiler was selected.
   - Fixed broken TypeScript client imports with trailing dots (`utils.` and `counterSlice.`).
   - Fixed NodeNext TypeScript server imports to require explicit `.js` extensions for native Node ESM compatibility.
   - Enhanced `sanitizePackageName` to handle `.` (current working directory) and empty string fallbacks.
   - Added inline directory collision validation to the terminal prompt.
   - Added `"engines": { "node": ">=18.11.0" }`.
   - Fixed `"bin"` definition in `package.json` to `"create-modern-mern-app": "bin/index.js"`.
5. **Package Payload Optimization:**  
   Using `"files": ["bin", "src", "README.md"]`, the package unpacked size is only ~46.9 kB and tarball size is ~13.9 kB.

---

## 7. How to Run, Test, and Publish Updates

### To run tests locally:
```powershell
npm test
```

### To test the CLI locally:
```powershell
node ./bin/index.js my-test-app
```

### To release an update to npm:
```powershell
# 1. Commit and push changes
git add .
git commit -m "feat: your change"
git push origin main

# 2. Bump version & publish
npm version patch
npm publish
git push --tags origin main
```
