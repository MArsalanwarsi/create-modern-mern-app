# create-fullstack-mern

An interactive CLI tool to generate production-ready **MERN (MongoDB, Express, React, Node.js)** full-stack applications with sliced layouts, Vite React frontend variants, and modern Express architecture.

## Quick Start

You can run this generator directly with `npx`:

```bash
npx create-fullstack-mern
```

Or pass a project name directly:

```bash
npx create-fullstack-mern my-app
```

---

## Interactive Prompts

When you run the command, it guides you through a clean wizard:

1. **Project Name**: Sets target folder and sanitized npm package name.
2. **Frontend Variant**:
   - `JavaScript`
   - `JavaScript + React Compiler` (React 19 Compiler memoization)
   - `TypeScript`
   - `TypeScript + React Compiler`
3. **Frontend Packages**:
   - `Tailwind CSS` (Configured with PostCSS)
   - `Shadcn UI` (`components.json`, cn helper, sample button)
   - `Redux Toolkit` (Store and counter slice pre-configured)
   - `React-Toastify` (Toast notifications pre-mounted)
   *(React Router DOM is included by default to power nested sliced layouts)*
4. **Backend Language**:
   - `JavaScript (ES Modules)` (Native `"type": "module"`)
   - `TypeScript` (Configured with `tsconfig.json`, `tsx` dev runner, and type definitions)
5. **Backend Add-ons**:
   - `CORS` (Cross-Origin Resource Sharing)
   - `dotenv` (Environment variables management)
   - `Multer` (Disk storage file uploads)
   - `Cloudinary` (Cloud asset management)
   - `Nodemailer` (SMTP email delivery)
   *(Express and MongoDB/Mongoose are included as the core foundation)*
6. **Install Dependencies**:
   - Choice to run `npm install` automatically across root, client, and server, or print manual instructions.

---

## Generated Folder Structure

```
my-app/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Atomic UI components
│   │   ├── layout/             # Sliced layout architecture
│   │   │   ├── slices/         # Navbar, Sidebar, Footer, Header
│   │   │   ├── WebsiteLayout   # Public layout (<Outlet />)
│   │   │   └── DashboardLayout # Admin dashboard layout (<Outlet />)
│   │   ├── pages/
│   │   │   ├── website/        # Home, About, Contact
│   │   │   └── dashboard/      # Overview, Settings
│   │   ├── App                 # Pre-wired React Router DOM routes
│   │   └── main                # React entry
│   ├── package.json
│   └── vite.config
│
├── server/                     # Express + MongoDB Backend
│   ├── src/
│   │   ├── config/             # Database (db.js) & service configs
│   │   ├── controllers/        # Route controllers (api.controller.js)
│   │   ├── models/             # Mongoose schemas (user.model.js)
│   │   ├── routes/             # Express routes (api.routes.js)
│   │   ├── middlewares/        # Error handlers & upload middlewares
│   │   ├── utils/              # Email & helper services
│   │   └── index               # Main server bootstrap
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root concurrent scripts
└── README.md
```

## Running the Generated App

```bash
cd my-app

# If dependencies were not installed automatically:
npm run install:all

# Run both client and server concurrently:
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:5000](http://localhost:5000)
