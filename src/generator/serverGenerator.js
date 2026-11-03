import { randomBytes } from 'node:crypto';
import { generateApiTests } from './apiTests.js';
import { addAuthServer } from './authServer.js';
import { writeFileTree } from '../utils/fs-helpers.js';
import { sanitizePackageName } from '../utils/naming.js';

export async function generateServer(targetDir, options = {}) {
  const {
    projectName = 'server',
    language = 'js',
    addOns = [],
    auth = true
  } = options;

  const isTs = language === 'ts';
  const ext = isTs ? 'ts' : 'js';
  const importExt = '.js';
  const databaseName = sanitizePackageName(projectName).replace(/[^a-z0-9_-]/g, '-').slice(0, 60);

  const hasCors = addOns.includes('cors');
  const hasMulter = addOns.includes('multer');
  const hasCloudinary = addOns.includes('cloudinary');
  const hasNodemailer = addOns.includes('nodemailer');
  const hasDotenv = addOns.includes('dotenv');
  const hasAuth = auth !== false && auth !== 'false';

  const files = {};

  // 1. package.json dependencies
  const dependencies = {
    helmet: '^8.3.0',
    express: '^5.3.0',
    mongoose: '^9.11.4'
  };

  const devDependencies = { oxlint: '^1.90.0' };

  if (hasAuth) {
    dependencies['bcryptjs'] = '^3.0.3';
    dependencies['jsonwebtoken'] = '^9.0.3';
    dependencies['express-rate-limit'] = '^8.7.2';
  }

  if (hasDotenv) {
    dependencies['dotenv'] = '^18.0.9';
  }

  if (hasCors) {
    dependencies['cors'] = '^2.8.6';
    if (isTs) devDependencies['@types/cors'] = '^2.8.19';
  }

  if (hasMulter) {
    dependencies['multer'] = '^2.5.0';
    if (isTs) devDependencies['@types/multer'] = '^2.3.0';
  }

  if (hasCloudinary) {
    dependencies['cloudinary'] = '^2.11.0';
  }

  if (hasNodemailer) {
    dependencies['nodemailer'] = '^10.3.1';
    if (isTs) devDependencies['@types/nodemailer'] = '^8.0.2';
  }

  if (isTs) {
    devDependencies['typescript'] = '^7.0.2';
    devDependencies['tsx'] = '^4.23.15';
    devDependencies['@types/node'] = '^26.6.6';
    devDependencies['@types/express'] = '^5.0.6';
    if (hasAuth) {
      devDependencies['@types/jsonwebtoken'] = '^9.0.10';
      devDependencies['@types/bcryptjs'] = '^2.4.6';
    }
  }

  const serverPkg = {
    name: sanitizePackageName(projectName) + '-server',
    version: '1.0.0',
    type: 'module',
    engines: { node: '>=24.16.0' },
    scripts: isTs
      ? {
          lint: `oxlint index.${ext} src --deny-warnings`,
          dev: 'tsx watch --env-file-if-exists=.env index.ts',
          build: 'tsc',
          start: 'node --env-file-if-exists=.env dist/index.js'
        }
      : {
          lint: `oxlint index.${ext} src --deny-warnings`,
          build: 'node --check index.js',
          dev: 'node --watch --env-file-if-exists=.env index.js',
          start: 'node --env-file-if-exists=.env index.js'
        },
    dependencies,
    devDependencies
  };

  serverPkg.scripts.test = isTs ? 'tsx --test test/api.test.js' : 'node --test test/api.test.js';
  files['test/api.test.js'] = generateApiTests(isTs, hasAuth);
  files['package.json'] = JSON.stringify(serverPkg, null, 2);

  // 2. TypeScript config if applicable
  if (isTs) {
    files['tsconfig.json'] = JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        types: ["node"],
        module: "NodeNext",
        moduleResolution: "NodeNext",
        outDir: "./dist",
        rootDir: ".",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["index.ts", "src/**/*"]
    }, null, 2);
  }

  // 3. Database connection: src/config/db.{js,ts}
  files[`src/config/db.${ext}`] = `import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/${databaseName}';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
`;

  // 4. Cloudinary configuration: src/config/cloudinary.{js,ts} (conditional)
  if (hasCloudinary) {
    files[`src/config/cloudinary.${ext}`] = `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
`;
  }

  // 5. Auth Server (conditional scaffolding)
  if (hasAuth) {
    addAuthServer(files, isTs);
  }

  // 6. Controller: src/controllers/api.controller.{js,ts}
  if (hasAuth) {
    files[`src/controllers/api.controller.${ext}`] = `import { getUsers as fetchUsers } from '../services/user.service${importExt}';
${isTs ? "import type { Request, Response } from 'express';\n\n" : ''}export function getHealthCheck(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''})${isTs ? ': void' : ''} {
  res.json({
    status: 'online',
    message: 'Backend server is running smoothly',
    timestamp: new Date().toISOString()
  });
}

export async function getUsers(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''})${isTs ? ': Promise<void>' : ''} {
  try {
    const users = await fetchUsers(50);
    res.json({ success: true, count: users.length, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
}
`;
  } else {
    files[`src/controllers/api.controller.${ext}`] = `${isTs ? "import type { Request, Response } from 'express';\n\n" : ''}export function getHealthCheck(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''})${isTs ? ': void' : ''} {
  res.json({
    status: 'online',
    message: 'Backend server is running smoothly',
    timestamp: new Date().toISOString()
  });
}
`;
  }

  // 7. Routes: src/routes/api.routes.{js,ts}
  if (hasAuth) {
    files[`src/routes/api.routes.${ext}`] = `import { Router } from 'express';
import { getHealthCheck, getUsers } from '../controllers/api.controller${importExt}';
import authRoutes from './auth.routes${importExt}';
import { requireToken } from '../middlewares/requireToken${importExt}';
import { requireRole } from '../middlewares/requireRole${importExt}';
${hasMulter ? `import { upload } from '../middlewares/multer${importExt}';\n` : ''}
const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// Public health check
router.get('/health', getHealthCheck);

// Protected administrative routes
router.get('/users', requireToken, requireRole('admin'), getUsers);

${hasMulter ? `// Sample file upload route
router.post('/upload', requireToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: req.file.filename || req.file.originalname
  });
});
` : ''}export default router;
`;
  } else {
    files[`src/routes/api.routes.${ext}`] = `import { Router } from 'express';
import { getHealthCheck } from '../controllers/api.controller${importExt}';

const router = Router();
router.get('/health', getHealthCheck);
export default router;
`;
  }

  // 8. Middlewares
  files[`src/middlewares/errorHandler.${ext}`] = `${isTs ? "import type { Request, Response, NextFunction } from 'express';\n\n" : ''}export function errorHandler(err${isTs ? ': any' : ''}, _req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, _next${isTs ? ': NextFunction' : ''}) {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: (status < 500 ? err.message : 'Internal Server Error')
  });
}
`;

  // CSRF Protection Middleware
  files[`src/middlewares/csrf.${ext}`] = `${isTs ? "import type { Request, Response, NextFunction } from 'express';\n\n" : ''}// Cross-origin forms cannot supply this header. Only allow trusted origins in CORS.
export function csrfProtection(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, next${isTs ? ': NextFunction' : ''})${isTs ? ': void' : ''} {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Requested-With') !== 'mern-client') {
    res.status(403).json({ message: 'Missing API request header.' });
    return;
  }
  next();
}

export default csrfProtection;
`;

  // Multer configuration & middleware
  if (hasMulter) {
    files[`src/config/multer.${ext}`] = `import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve uploads directory relative to the server root (server/uploads/)
const uploadDir${isTs ? ': string' : ''} = process.env.UPLOAD_DIR || fileURLToPath(new URL('../../uploads', import.meta.url));
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
`;

    files[`src/middlewares/multer.${ext}`] = `export { upload, default } from '../config/multer${importExt}';\n`;
  }

  // 9. Utilities: Nodemailer (conditional)
  if (hasNodemailer) {
    files[`src/utils/nodemailer.${ext}`] = `import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

export async function sendEmail({ to, subject, html }${isTs ? ': { to: string; subject: string; html: string }' : ''}) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"MERN Application" <noreply@example.com>',
    to,
    subject,
    html
  });
}
`;
  }

  // 10. Main entry point: src/index.{js,ts}
  let indexCode = '';
  if (hasDotenv) {
    indexCode += `import 'dotenv/config';\n`;
  }
  indexCode += `import express from 'express';\nimport helmet from 'helmet';\n`;
  if (hasCors) {
    indexCode += `import cors from 'cors';\n`;
  }
  if (hasAuth) indexCode += `import { prepareLoginLimit } from './src/config/loginLimit.js';\n`;
  indexCode += `import { connectDB } from './src/config/db${importExt}';\n`;
  indexCode += `import apiRoutes from './src/routes/api.routes${importExt}';\n`;
  indexCode += `import { csrfProtection } from './src/middlewares/csrf${importExt}';\n`;
  indexCode += `import { errorHandler } from './src/middlewares/errorHandler${importExt}';\n\n`;

  indexCode += `export const app = express();\napp.use(helmet());\n`;
  if (hasAuth) indexCode += `if (process.env.TRUSTED_PROXY_CIDRS) app.set('trust proxy', process.env.TRUSTED_PROXY_CIDRS);\n`;
  indexCode += `const PORT = process.env.PORT || 5000;\n\n`;

  if (hasCors) {
    indexCode += `app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));\n\n`;
  }

  indexCode += `app.use(express.json());\n`;
  indexCode += `app.use(express.urlencoded({ extended: true }));\n\n`;

  indexCode += `// API Security: Cross-origin forms cannot supply this header. Only allow trusted origins in CORS.\n`;
  indexCode += `app.use('/api', csrfProtection);\n\n`;

  indexCode += `app.use('/api', apiRoutes);\n\n`;

  indexCode += `app.use(errorHandler);\n\n`;

  indexCode += `if (import.meta.main) {\n  await connectDB();\n`;
  if (hasAuth) indexCode += `  await prepareLoginLimit();\n`;
  indexCode += `  app.listen(PORT, () => {\n`;
  indexCode += `    console.log(\`Server is running on http://localhost:\${PORT}\`);\n`;
  indexCode += `  });\n`;
  indexCode += `}\n`;

  files[`index.${ext}`] = indexCode;

  // 11. .env.example and .env
  let envExample = `# Server Configuration\nPORT=5000\nNODE_ENV=development\n\n# Database\nMONGO_URI=mongodb://127.0.0.1:27017/${databaseName}\n`;
  if (hasCloudinary) {
    envExample += `\n# Cloudinary\nCLOUDINARY_CLOUD_NAME=your_cloud_name\nCLOUDINARY_API_KEY=your_api_key\nCLOUDINARY_API_SECRET=your_api_secret\n`;
  }
  if (hasNodemailer) {
    envExample += `\n# Nodemailer SMTP\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your_email@gmail.com\nSMTP_PASS=your_app_password\nEMAIL_FROM="App Support" <no-reply@app.com>\n`;
  }

  let envFile = envExample.split('\n# Cloudinary')[0].split('\n# Nodemailer')[0];

  if (hasAuth) {
    envExample += '\n# Use mongo on every API replica to share login attempts.\nLOGIN_LIMIT_STORE=memory\n# Trusted ingress addresses only (comma-separated CIDRs).\nTRUSTED_PROXY_CIDRS=\n';
    envExample += '\n# Generate a unique secret per environment (32 bytes or more).\nJWT_SECRET=\n';
    envFile += '\nJWT_SECRET=' + randomBytes(48).toString('hex') + '\n';
  }

  files['.env.example'] = envExample;
  files['.env'] = envFile;

  await writeFileTree(targetDir, files);
}
