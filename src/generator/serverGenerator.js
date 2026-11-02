import { writeFileTree } from '../utils/fs-helpers.js';
import { sanitizePackageName } from '../utils/naming.js';

export async function generateServer(targetDir, options) {
  const { projectName = 'server', language = 'js', addOns = [] } = options;
  const isTs = language === 'ts';
  const ext = isTs ? 'ts' : 'js';
  const importExt = '.js';

  const hasCors = addOns.includes('cors');
  const hasMulter = addOns.includes('multer');
  const hasCloudinary = addOns.includes('cloudinary');
  const hasNodemailer = addOns.includes('nodemailer');
  const hasDotenv = addOns.includes('dotenv');

  const files = {};

  // 1. package.json dependencies
  const dependencies = {
    express: '^4.21.2',
    mongoose: '^8.9.0'
  };

  const devDependencies = {};

  if (hasDotenv) {
    dependencies['dotenv'] = '^16.4.7';
  }

  if (hasCors) {
    dependencies['cors'] = '^2.8.5';
    if (isTs) devDependencies['@types/cors'] = '^2.8.17';
  }

  if (hasMulter) {
    dependencies['multer'] = '^1.4.5-lts.1';
    if (isTs) devDependencies['@types/multer'] = '^1.4.12';
  }

  if (hasCloudinary) {
    dependencies['cloudinary'] = '^2.5.1';
  }

  if (hasNodemailer) {
    dependencies['nodemailer'] = '^6.9.16';
    if (isTs) devDependencies['@types/nodemailer'] = '^6.4.17';
  }

  if (isTs) {
    devDependencies['typescript'] = '^5.7.0';
    devDependencies['tsx'] = '^4.19.2';
    devDependencies['@types/node'] = '^22.10.0';
    devDependencies['@types/express'] = '^5.0.0';
  }

  const serverPkg = {
    name: sanitizePackageName(projectName) + '-server',
    version: '1.0.0',
    type: 'module',
    scripts: isTs
      ? {
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js'
        }
      : {
          dev: 'node --watch src/index.js',
          start: 'node src/index.js'
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
        module: "NodeNext",
        moduleResolution: "NodeNext",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ["src/**/*"]
    }, null, 2);
  }

  // 3. Database connection: src/config/db.{js,ts}
  files[`src/config/db.${ext}`] = `import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/${sanitizePackageName(projectName)}';
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

  // 5. Starter Mongoose Model: src/models/user.model.{js,ts}
  files[`src/models/user.model.${ext}`] = `import mongoose${isTs ? ', { Document, Schema }' : ''} from 'mongoose';

${isTs ? `export interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({` : 'const UserSchema = new mongoose.Schema({'}
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model${isTs ? '<IUser>' : ''}('User', UserSchema);
`;

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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
}

export async function createUser(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const user = await User.create({ name, email });
    res.status(201).json({ success: true, data: user });
  } catch (error${isTs ? ': any' : ''}) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
}
`;

  // 7. Routes: src/routes/api.routes.{js,ts}
  files[`src/routes/api.routes.${ext}`] = `import { Router } from 'express';
import { getHealthCheck, getUsers, createUser } from '../controllers/api.controller${importExt}';
${hasMulter ? `import { upload } from '../middlewares/multer${importExt}';` : ''}

const router = Router();

router.get('/health', getHealthCheck);
router.get('/users', getUsers);
router.post('/users', createUser);

${hasMulter ? `// Sample file upload route
router.post('/upload', upload.single('file'), (req, res) => {
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

export function errorHandler(err${isTs ? ': any' : ''}, req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, next${isTs ? ': NextFunction' : ''}) {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
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
  indexCode += `import { connectDB } from './config/db${importExt}';\n`;
  indexCode += `import apiRoutes from './routes/api.routes${importExt}';\n`;
  indexCode += `import { errorHandler } from './middlewares/errorHandler${importExt}';\n\n`;

  indexCode += `const app = express();\n`;
  indexCode += `const PORT = process.env.PORT || 5000;\n\n`;

  if (hasCors) {
    indexCode += `// CORS middleware\napp.use(cors());\n\n`;
  }

  indexCode += `// Body parsers\n`;
  indexCode += `app.use(express.json());\n`;
  indexCode += `app.use(express.urlencoded({ extended: true }));\n\n`;

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

  files[`src/index.${ext}`] = indexCode;

  // 11. .env.example
  let envExample = `# Server Configuration\nPORT=5000\nNODE_ENV=development\n\n# Database\nMONGO_URI=mongodb://localhost:27017/${sanitizePackageName(projectName)}\n`;
  if (hasCloudinary) {
    envExample += `\n# Cloudinary\nCLOUDINARY_CLOUD_NAME=your_cloud_name\nCLOUDINARY_API_KEY=your_api_key\nCLOUDINARY_API_SECRET=your_api_secret\n`;
  }
  if (hasNodemailer) {
    envExample += `\n# Nodemailer SMTP\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your_email@gmail.com\nSMTP_PASS=your_app_password\nEMAIL_FROM="App Support" <no-reply@app.com>\n`;
  }
  files['.env.example'] = envExample;

  await writeFileTree(targetDir, files);
}
