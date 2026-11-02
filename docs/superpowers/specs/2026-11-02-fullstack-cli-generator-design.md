# Design: Full-Stack CLI Project Generator

## 1. Intent and the Why
Developers frequently lose hours repeatedly configuring boilerplate for full-stack applications: setting up Vite, configuring React compilers, wiring Tailwind and UI libraries, assembling routing and layouts, and building an Express/MongoDB backend with upload handlers, email utilities, and environment configurations.

This project delivers an interactive command-line interface (CLI) tool published to npm (e.g., runnable via `npx` or installed globally) that generates a clean, production-ready full-stack workspace in seconds.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Provide an interactive, responsive terminal wizard using `@clack/prompts` (similar to modern Vite/Astro CLI experiences).
- Prompt the user through a guided setup flow:
  1. Project name (and directory validation)
  2. Client variant selection:
     - JavaScript
     - JavaScript + React Compiler
     - TypeScript
     - TypeScript + React Compiler
  3. Frontend libraries (multi-select, with React Router DOM built-in as a core requirement):
     - Tailwind CSS
     - Shadcn UI (requires Tailwind)
     - React-Toastify
     - Redux Toolkit
     *(Note: React Router DOM is included by default in all client setups to reliably power the multi-page website and dashboard layout structure).*
  4. Backend language selection:
     - JavaScript (Modern Node.js ES Modules)
     - TypeScript (Node.js with TypeScript, tsx dev runner, and type definitions)
  5. Backend add-ons (multi-select with Express + MongoDB/Mongoose as the standard backend core):
     - CORS (pre-selected by default)
     - Multer (file uploads)
     - Cloudinary (cloud asset storage)
     - Nodemailer (email delivery)
     - dotenv
  6. Dependency installation option: prompt whether to run `npm install` automatically or print instructions for manual installation.
- Generate a clean folder structure:
  - Root directory with unified or independent scripts and README.
  - `client/`:
    - Vite-based React setup matching the chosen variant.
    - `src/components/`: Reusable atomic UI components.
    - `src/pages/`:
      - `dashboard/`: Application/admin views (e.g., Overview, Settings).
      - `website/`: Public-facing views (e.g., Home, About, Contact).
    - `src/layout/`: Sliced layout architecture containing sectional slices (Navbar, Footer, Sidebar, Header) and parent wrappers (`WebsiteLayout`, `DashboardLayout`).
    - Conditional boilerplate wiring for selected libraries (e.g., React Router DOM routing between website and dashboard layouts, Redux store provider, ToastContainer).
  - `server/`:
    - Modern ES Modules (`"type": "module"` in `package.json`).
    - `src/config/`: `db.js` (MongoDB/Mongoose connection), `cloudinary.js` (if selected).
    - `src/models/`: Mongoose schemas.
    - `src/controllers/`: Route handlers and business logic.
    - `src/routes/`: Express route definitions.
    - `src/middlewares/`: `multer.js` (if selected), CORS, error handling.
    - `src/utils/`: `nodemailer.js` (if selected).
    - `src/index.js`: Main entry point mounting middleware, routes, and connecting DB.
    - `.env.example`: Pre-populated environment variable placeholders.

### Non-Goals
- Full-stack monolithic frameworks like Next.js or Remix (the target is a decoupled Vite frontend + Express backend).
- Relational database ORMs (Prisma/TypeORM/PostgreSQL) in this iteration; database focus is MongoDB.
- Persistent background daemons or deployment runners.

### Anti-Goals
- Brittle child-process wrapping of external scaffolding CLIs (e.g., executing `npm create vite` and mutating files on disk).
- Injecting dead code or unselected library dependencies into generated projects.

---

## 3. Constraints
- Runtime: Node.js >= 18.0.0.
- Cross-platform support: Must run reliably on Windows, macOS, and Linux without platform-specific path separator bugs.
- Self-contained packaging: All templates and scaffolding logic must be bundled inside the published npm package so scaffolding works completely offline.

---

## 4. Approaches Considered

### Approach 1: Modular Embedded Template Generator (Selected)
- **Concept:** Bundle modular base templates for the client variants and backend inside the CLI package. Use dynamic composition to merge optional features (Tailwind, Redux, Multer, Cloudinary, etc.) and programmatically construct the `package.json` manifests.
- **Pros:** Fast, completely offline, zero CLI brittleness, exact control over sliced layouts and pre-wired boilerplate.
- **Trade-offs:** Requires authoring and maintaining cohesive templates across combinations.

### Approach 2: Interactive Shell Wrapper (Rejected)
- **Concept:** Execute `npm create vite` via `child_process` and run shell commands, then rewrite files with regex/AST.
- **Cons:** Flaky, requires network connection, breaks when upstream CLIs change prompts, difficult to handle sliced layouts cleanly.

---

## 5. Architectural Specifications

### 5.1 CLI Workflow & Prompts
Using `@clack/prompts`:
1. `intro("Welcome to the Full-Stack App Generator")`
2. `text({ message: "What is your project name?", defaultValue: "my-app" })`
3. `select({ message: "Select a frontend variant:", options: [ ... ] })`
4. `multiselect({ message: "Select additional frontend packages (React Router DOM included by default):", options: [ ... ] })`
5. `select({ message: "Select backend language:", options: ["JavaScript (ES Modules)", "TypeScript"] })`
6. `multiselect({ message: "Select backend add-ons:", options: [ ... ] })`
7. `confirm({ message: "Would you like to install dependencies now?", default: true })`
8. Scaffold files -> optionally run `npm install` -> `outro("Project created successfully!")`

### 5.2 Client Architecture
- **Root Layout Routing:** React Router DOM is a core foundation for all client variants:
  - Route `/` renders `WebsiteLayout` containing `Navbar`, `Footer`, and `<Outlet />`.
    - Child routes: `/` (Home), `/about` (About), `/contact` (Contact).
  - Route `/dashboard` renders `DashboardLayout` containing `Sidebar`, `Header`, and `<Outlet />`.
    - Child routes: `/dashboard` (Overview), `/dashboard/settings` (Settings).
- **State & UI Integrations:**
  - Redux Toolkit: `src/store/index.js` or `index.ts` with a sample slice and `Provider` wrapped around the router.
  - Toastify: `<ToastContainer />` mounted at the root of `App.jsx`.
  - Tailwind: `tailwind.config.js` and `index.css` configured.
  - Shadcn UI: Configured `components.json`, utility `lib/utils.js|ts`, and sample button component if chosen.

### 5.3 Server Architecture
- **Module Format & Runtime:**
  - **JavaScript:** ES Modules (`"type": "module"`) running directly via Node.js runtime.
  - **TypeScript:** Configured `tsconfig.json`, `tsx` for high-speed dev server execution without manual build steps, and `@types/*` for Express, CORS, Multer, and Nodemailer.
- **Structure (`.js` or `.ts` depending on backend selection):**
  - `src/index.{js,ts}`: Bootstraps Express, connects DB, loads env, mounts CORS & routes.
  - `src/config/db.{js,ts}`: Mongoose `connectDB()` helper.
  - `src/config/cloudinary.{js,ts}`: Cloudinary v2 SDK configuration (conditional).
  - `src/middlewares/multer.{js,ts}`: Configured file upload middleware (conditional).
  - `src/utils/nodemailer.{js,ts}`: Configured transporter and sample email helper (conditional).
  - `src/routes/api.routes.{js,ts}`: Sample API health check and resource route.
  - `src/controllers/api.controller.{js,ts}`: Controller logic.
  - `src/models/user.model.{js,ts}`: Clean Mongoose starter model with schema/types.

---

## 6. What Is Left to the Builder
- Choosing exact package versions for dependencies in generated `package.json` manifests.
- Structuring root-level scripts (e.g. `npm run dev` at root concurrently running client and server, or separate instructions).
- Providing clear CLI help flags (e.g., `--help`, `--version`).
