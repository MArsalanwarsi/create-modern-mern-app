import { randomBytes } from 'node:crypto';
import { addAuthServer } from './authServer.js';
import { writeFileTree } from '../utils/fs-helpers.js';
import { sanitizePackageName } from '../utils/naming.js';

export async function generateServer(targetDir, options) {
  const { projectName = 'server', language = 'js', addOns = [] } = options;
  const isTs = language === 'ts';
  const ext = isTs ? 'ts' : 'js';
  const importExt = '.js';
  const databaseName = sanitizePackageName(projectName).replace(/[^a-z0-9_-]/g, '-').slice(0, 60);

  const hasCors = addOns.includes('cors');
  const hasMulter = addOns.includes('multer');
  const hasCloudinary = addOns.includes('cloudinary');
  const hasNodemailer = addOns.includes('nodemailer');
  const hasDotenv = addOns.includes('dotenv');

  const files = {};

  // 1. package.json dependencies
  const dependencies = {
    bcryptjs: '^3.0.3',
    jsonwebtoken: '^9.0.3',
    'express-rate-limit': '^8.7.2',
    express: '^5.3.0',
    mongoose: '^9.11.4'
  };

  const devDependencies = { oxlint: '^1.90.0' };

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
    devDependencies['@types/jsonwebtoken'] = '^9.0.10';
    devDependencies['tsx'] = '^4.23.15';
    devDependencies['@types/node'] = '^26.6.6';
    devDependencies['@types/express'] = '^5.0.6';
  }

  const serverPkg = {
    name: sanitizePackageName(projectName) + '-server',
    version: '1.0.0',
    type: 'module',
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

  addAuthServer(files, isTs);

  // 6. Controller: src/controllers/api.controller.{js,ts}
  files[`src/controllers/api.controller.${ext}`] = `import { User } from '../models/user.model${importExt}';
${isTs ? "import { Request, Response } from 'express';" : ''}

export async function getHealthCheck(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) {
  res.json({
    status: 'online',
    message: 'Backend server is running smoothly',
    timestamp: new Date().toISOString()
  });
}

export async function getUsers(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) {
  try {
    const users = await User.find().limit(50);
    res.json({ success: true, count: users.length, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
}

`;

  // 7. Routes: src/routes/api.routes.{js,ts}
  files[`src/routes/api.routes.${ext}`] = `import { Router } from 'express';
import { getHealthCheck, getUsers } from '../controllers/api.controller${importExt}';
${hasMulter ? `import { upload } from '../middlewares/multer${importExt}';` : ''}

import authRoutes from './auth.routes.js';
import { requireToken } from '../middlewares/requireToken.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();
router.use('/auth', authRoutes);

router.get('/health', getHealthCheck);
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
});` : ''}

export default router;
`;

  // 8. Middlewares
  files[`src/middlewares/errorHandler.${ext}`] = `${isTs ? "import { Request, Response, NextFunction } from 'express';" : ''}

export function errorHandler(err${isTs ? ': any' : ''}, req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, _next${isTs ? ': NextFunction' : ''}) {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: (status < 500 ? err.message : 'Internal Server Error')
  });
}
`;

  if (hasMulter) {
    files[`src/middlewares/multer.${ext}`] = `import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
`;
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
  indexCode += `import express from 'express';\n`;
  if (hasCors) {
    indexCode += `import cors from 'cors';\n`;
  }
  indexCode += `import { connectDB } from './src/config/db${importExt}';\n`;
  indexCode += `import apiRoutes from './src/routes/api.routes${importExt}';\n`;
  indexCode += `import { errorHandler } from './src/middlewares/errorHandler${importExt}';\n\n`;

  indexCode += `const app = express();\n`;
  indexCode += `const PORT = process.env.PORT || 5000;\n\n`;

  if (hasCors) {
    indexCode += `// CORS middleware\napp.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));\n\n`;
  }

  indexCode += `// Body parsers\n`;
  indexCode += `app.use(express.json());\n`;
  indexCode += `app.use(express.urlencoded({ extended: true }));\n\n`;

  indexCode += `// Cross-origin forms cannot supply this header. Only allow trusted origins in CORS.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Requested-With') !== 'mern-client') {
    res.status(403).json({ message: 'Missing API request header.' }); return;
  }
  next();
});\n`;

  indexCode += `// API Routes\n`;
  indexCode += `app.use('/api', apiRoutes);\n\n`;

  indexCode += `// Error handler\n`;
  indexCode += `app.use(errorHandler);\n\n`;

  indexCode += `// Connect Database & Start Server\n`;
  indexCode += `connectDB().then(() => {\n`;
  indexCode += `  app.listen(PORT, () => {\n`;
  indexCode += `    console.log(\`Server is running on http://localhost:\${PORT}\`);\n`;
  indexCode += `  });\n`;
  indexCode += `});\n`;

  files[`index.${ext}`] = indexCode;

  // 11. .env.example
  let envExample = `# Server Configuration\nPORT=5000\nNODE_ENV=development\n\n# Database\nMONGO_URI=mongodb://127.0.0.1:27017/${databaseName}\n`;
  if (hasCloudinary) {
    envExample += `\n# Cloudinary\nCLOUDINARY_CLOUD_NAME=your_cloud_name\nCLOUDINARY_API_KEY=your_api_key\nCLOUDINARY_API_SECRET=your_api_secret\n`;
  }
  if (hasNodemailer) {
    envExample += `\n# Nodemailer SMTP\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your_email@gmail.com\nSMTP_PASS=your_app_password\nEMAIL_FROM="App Support" <no-reply@app.com>\n`;
  }
  files['.env.example'] = envExample + '\n# Generate a unique secret per environment (32 bytes or more).\nJWT_SECRET=\n';
  files['.env'] = envExample.split('\n# Cloudinary')[0].split('\n# Nodemailer')[0] + '\nJWT_SECRET=' + randomBytes(48).toString('hex') + '\n';

  await writeFileTree(targetDir, files);
}
