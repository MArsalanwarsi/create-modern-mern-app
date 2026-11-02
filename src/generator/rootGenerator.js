import { writeFileTree } from '../utils/fs-helpers.js';
import { sanitizePackageName } from '../utils/naming.js';

export async function generateRoot(targetDir, projectName) {
  const sanitizedName = sanitizePackageName(projectName);

  const rootPkg = {
    name: sanitizedName,
    version: '1.0.0',
    private: true,
    description: `Full-stack MERN application (${sanitizedName})`,
    scripts: {
      "dev": "concurrently -n \"CLIENT,SERVER\" -c \"cyan,green\" \"npm run dev:client\" \"npm run dev:server\"",
      "dev:client": "npm --prefix client run dev",
      "dev:server": "npm --prefix server run dev",
      "build:client": "npm --prefix client run build",
      "build:server": "npm --prefix server run build",
      "build": "npm run build:client && npm run build:server",
      "install:all": "npm install && npm --prefix client install && npm --prefix server install"
    },
    devDependencies: {
      "concurrently": "^9.1.0"
    }
  };

  const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production build outputs
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS Files
.DS_Store
Thumbs.db

# Uploads directory
server/uploads/
`;

  const readme = `# ${projectName}

A full-stack MERN (MongoDB, Express, React, Node.js) application scaffolded with \`create-fullstack-mern\`.

## Project Structure

\`\`\`
${projectName}/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable atomic UI components
│   │   ├── layout/             # Sliced layout architecture
│   │   │   ├── slices/         # Sectional layout slices (Navbar, Sidebar, Footer, Header)
│   │   │   ├── WebsiteLayout   # Public website layout wrapper (<Outlet />)
│   │   │   └── DashboardLayout # Admin dashboard layout wrapper (<Outlet />)
│   │   ├── pages/              # Application pages
│   │   │   ├── website/        # Home, About, Contact
│   │   │   └── dashboard/      # Overview, Settings
│   │   ├── App                 # Pre-wired React Router DOM routes
│   │   └── main                # React DOM entry point
│   ├── package.json
│   └── vite.config
│
├── server/                     # Express + MongoDB Backend
│   ├── src/
│   │   ├── config/             # DB & service connections (db.js, cloudinary.js)
│   │   ├── controllers/        # Route business logic (api.controller.js)
│   │   ├── models/             # Mongoose schemas (user.model.js)
│   │   ├── routes/             # Express API routes (api.routes.js)
│   │   ├── middlewares/        # Middlewares (errorHandler, multer)
│   │   ├── utils/              # Utilities (nodemailer)
│   │   └── index               # Main server bootstrap
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── package.json                # Root concurrent scripts
└── README.md
\`\`\`

## Getting Started

### 1. Configure Backend Environment
Copy the sample environment file in the \`server\` directory:
\`\`\`bash
cd server
cp .env.example .env
\`\`\`
Update \`MONGO_URI\` with your MongoDB connection string (or use the local default).

### 2. Install Dependencies
If you did not install dependencies during scaffolding:
\`\`\`bash
npm run install:all
\`\`\`

### 3. Run Development Servers
Start both the frontend client and backend server concurrently:
\`\`\`bash
npm run dev
\`\`\`
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
`;

  await writeFileTree(targetDir, {
    'package.json': JSON.stringify(rootPkg, null, 2),
    '.gitignore': gitignore,
    'README.md': readme
  });
}
