// Express 5 forwards rejected async handlers to the generated error middleware.
export function addAuthServer(files, isTs) {
  const ext = isTs ? 'ts' : 'js';
  const importExt = '.js';
  const handler = isTs ? ': RequestHandler' : '';
  const types = isTs ? "import type { RequestHandler } from 'express';\n" : '';
  const ctrlTypes = isTs ? "import type { RequestHandler, Request, Response, NextFunction } from 'express';\n" : '';

  // 1. User Model: src/models/user.model.{js,ts}
  if (isTs) {
    files[`src/models/user.model.ts`] = `import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'member' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new mongoose.Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['member', 'admin'], default: 'member' }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', schema);
`;
  } else {
    files[`src/models/user.model.js`] = `import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['member', 'admin'], default: 'member' }
}, { timestamps: true });

export const User = mongoose.model('User', schema);
`;
  }

  // 2. Session Configuration: src/config/session.{js,ts}
  files[`src/config/session.${ext}`] = `import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if (!secret || Buffer.byteLength(secret) < 32) {
  throw new Error('Set JWT_SECRET to at least 32 random bytes in server/.env');
}
const issuer = 'mern-api';
export const cookieName = 'mern_session';
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict'${isTs ? ' as const' : ''}, path: '/api' };
export const issueToken = (id${isTs ? ': string' : ''}) => jwt.sign({}, secret, { subject: id, issuer, expiresIn: '1h', algorithm: 'HS256' });
export const verifyToken = (token${isTs ? ': string' : ''}) => jwt.verify(token, secret, { issuer, algorithms: ['HS256'] });
`;

  // 3. Auth Service: src/services/auth.service.{js,ts}
  files[`src/services/auth.service.${ext}`] = `import bcrypt from 'bcryptjs';
import { User } from '../models/user.model${importExt}';
import { issueToken } from '../config/session${importExt}';

// Precomputed 12-round bcrypt hash constant for constant-time comparison on unknown user
// Eliminates cold-start startup delay from top-level await bcrypt.hash()
const DUMMY_HASH = '$2b$12$29KBqVmSTgDWx5KlespVgumNt2B.x7kbhflZRvnqprab6KH4Ukqia';

export { issueToken };
${isTs ? `
export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthUserSummary {
  _id: unknown;
  name: string;
  email: string;
  role: string;
}

export interface AuthSessionResult {
  user: AuthUserSummary;
  token: string;
}
` : ''}
export async function registerUser({ name, email, password }${isTs ? ': RegisterUserInput' : ''})${isTs ? ': Promise<AuthSessionResult>' : ''} {
  const address = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: name.trim(),
      email: address,
      passwordHash
    });
    const token = issueToken(String(user._id));
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (err${isTs ? ': unknown' : ''}) {
    if (err && typeof err === 'object' && 'code' in err && ${isTs ? '(err as { code: number }).code' : 'err.code'} === 11000) {
      const error = Object.assign(new Error('An account already uses that email.'), { statusCode: 409, code: 11000 });
      throw error;
    }
    throw err;
  }
}

export async function authenticateUser({ email, password }${isTs ? ': AuthenticateUserInput' : ''})${isTs ? ': Promise<AuthSessionResult>' : ''} {
  const address = email.trim().toLowerCase();
  const user = await User.findOne({ email: address }).select('+passwordHash');

  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !matches) {
    const error = Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
    throw error;
  }

  const token = issueToken(String(user._id));
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
}
`;

  // 4. User Service: src/services/user.service.{js,ts}
  files[`src/services/user.service.${ext}`] = `import { User } from '../models/user.model${importExt}';

export async function getUsers(limit${isTs ? ': number' : ''} = 50) {
  return User.find().limit(limit);
}

export async function getUserById(id${isTs ? ': string' : ''}) {
  return User.findById(id).select('name email role').lean();
}

export const getUsersList = getUsers;
`;

  // 5. Middlewares: requireToken and requireRole
  files[`src/middlewares/requireToken.${ext}`] = `${types}import { cookieName, verifyToken } from '../config/session${importExt}';
import { getUserById } from '../services/user.service${importExt}';

export const requireToken${handler} = async (req, res, next) => {
  const cookie = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(cookieName + '='));
  let subject${isTs ? ': string' : ''};
  try {
    const payload = verifyToken(cookie?.slice(cookieName.length + 1) || '');
    if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.sub)) throw new Error();
    subject = payload.sub;
  } catch {
    res.status(401).json({ message: 'Sign in to continue.' });
    return;
  }
  const user = await getUserById(subject);
  if (!user) { res.status(401).json({ message: 'Account no longer exists.' }); return; }
  res.locals.user = user;
  next();
};
`;

  files[`src/middlewares/requireRole.${ext}`] = `${types}export function requireRole(role${isTs ? ': string' : ''})${handler} {
  return (_req, res, next) => {
    if (res.locals.user?.role !== role) { res.status(403).json({ message: 'Administrator access required.' }); return; }
    next();
  };
}
`;

  // 6. Auth Controller: src/controllers/auth.controller.{js,ts}
  files[`src/controllers/auth.controller.${ext}`] = `${ctrlTypes}import { registerUser, authenticateUser } from '../services/auth.service${importExt}';
import { cookieName, cookieOptions } from '../config/session${importExt}';

export const authenticate = (signup${isTs ? ': boolean' : ''})${handler} => async (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, next${isTs ? ': NextFunction' : ''}) => {
  const { name, email, password } = req.body ?? {};
  if (
    typeof email !== 'string' || email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' || !password || Buffer.byteLength(password) > 72 ||
    (signup && (password.length < 12 || typeof name !== 'string' || !name.trim() || name.trim().length > 100))
  ) {
    res.status(400).json({ message: 'Check your account details. New passwords require at least 12 characters and at most 72 bytes.' });
    return;
  }

  try {
    const result = signup
      ? await registerUser({ name: name.trim(), email, password })
      : await authenticateUser({ email, password });

    res.cookie(cookieName, result.token, { ...cookieOptions, maxAge: 3600000 });
    res.status(signup ? 201 : 200).json({ user: result.user });
  } catch (err${isTs ? ': unknown' : ''}) {
    if (err && typeof err === 'object') {
${isTs ? `      const errorObj = err as { statusCode?: number; code?: number; message?: string };
      if (errorObj.statusCode === 409 || errorObj.code === 11000) {
        res.status(409).json({ message: errorObj.message || 'An account already uses that email.' });
        return;
      }
      if (errorObj.statusCode === 401) {
        res.status(401).json({ message: errorObj.message || 'Invalid email or password.' });
        return;
      }` : `      const status = 'statusCode' in err ? err.statusCode : undefined;
      const code = 'code' in err ? err.code : undefined;
      if (status === 409 || code === 11000) {
        res.status(409).json({ message: err.message || 'An account already uses that email.' });
        return;
      }
      if (status === 401) {
        res.status(401).json({ message: err.message || 'Invalid email or password.' });
        return;
      }`}
    }
    next(err);
  }
};

export const signup${handler} = authenticate(true);
export const login${handler} = authenticate(false);
`;

  // 7. Auth Routes: src/routes/auth.routes.{js,ts}
  files[`src/routes/auth.routes.${ext}`] = `import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '../controllers/auth.controller${importExt}';
import { requireToken } from '../middlewares/requireToken${importExt}';
import { cookieName, cookieOptions } from '../config/session${importExt}';

const router = Router();
const limit = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many attempts. Try again later.' } });
router.post('/signup', limit, authenticate(true));
router.post('/login', limit, authenticate(false));
router.get('/me', requireToken, (_req, res) => res.json({ user: res.locals.user }));
router.post('/logout', (_req, res) => { res.clearCookie(cookieName, cookieOptions); res.sendStatus(204); });
export default router;
`;
}
