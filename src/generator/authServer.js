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
  return User.find().select('_id name email role').sort({ _id: -1 }).limit(limit).lean();
}

export async function getUserById(id${isTs ? ': string' : ''}) {
  return User.findById(id).select('name email role').lean();
}

export const getUsersList = getUsers;
`;

  // 5. Middlewares: requireToken and requireRole
  files[`src/middlewares/requireToken.${ext}`] = `${types}import { cookieName, verifyToken } from '../config/session${importExt}';
import { getUserById } from '../services/user.service${importExt}';
${isTs ? `
declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}
` : ''}
export const requireToken${handler} = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = (typeof authHeader === 'string' && authHeader.startsWith('Bearer '))
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    const cookie = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(cookieName + '='));
    if (cookie) token = cookie.slice(cookieName.length + 1);
  }

  if (!token) {
    res.status(401).json({ message: 'Sign in to continue.' });
    return;
  }

  let subject${isTs ? ': string' : ''};
  try {
    const payload = verifyToken(token);
    const rawSub = typeof payload === 'object' && payload !== null
      ? (payload.sub || ${isTs ? '(payload as Record<string, any>).id' : 'payload.id'})
      : null;
    if (typeof rawSub !== 'string' || !/^[a-f0-9]{24}$/i.test(rawSub)) throw new Error();
    subject = rawSub;
  } catch {
    res.status(401).json({ message: 'Sign in to continue.' });
    return;
  }

  const user = await getUserById(subject);
  if (!user) {
    res.status(401).json({ message: 'Account no longer exists.' });
    return;
  }

  req.user = user;
  res.locals.user = user;
  next();
};
`;

  files[`src/middlewares/requireRole.${ext}`] = `${types}export function requireRole(roles${isTs ? ': string | string[]' : ''})${handler} {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const user = req.user || res.locals.user;
    if (!user) {
      res.status(401).json({ message: 'Sign in to continue.' });
      return;
    }
    if (!allowed.includes(user.role)) {
      if (allowed.includes('admin')) {
        res.status(403).json({ message: 'Administrator access required.' });
        return;
      }
      res.status(403).json({ message: \`Access denied: requires one of the following roles: \${allowed.join(', ')}.\` });
      return;
    }
    next();
  };
}
`;

  // 6. Auth Controller: src/controllers/auth.controller.{js,ts}
  files[`src/controllers/auth.controller.${ext}`] = `${ctrlTypes}import { registerUser, authenticateUser } from '../services/auth.service${importExt}';
import { cookieName, cookieOptions } from '../config/session${importExt}';

export async function signup(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, next${isTs ? ': NextFunction' : ''})${isTs ? ': Promise<void>' : ''} {
  const { name, email, password } = req.body ?? {};
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
    typeof email !== 'string' || email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72
  ) {
    res.status(400).json({ message: 'Check your account details. New passwords require at least 8 characters and at most 72 bytes.' });
    return;
  }

  try {
    const result = await registerUser({ name: name.trim(), email: email.trim(), password });
    res.cookie(cookieName, result.token, { ...cookieOptions, maxAge: 3600000 });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (err${isTs ? ': unknown' : ''}) {
    if (err && typeof err === 'object') {
${isTs ? `      const errorObj = err as { statusCode?: number; code?: number; message?: string };
      if (errorObj.statusCode === 409 || errorObj.code === 11000) {
        res.status(409).json({ message: errorObj.message || 'An account already uses that email.' });
        return;
      }` : `      const status = 'statusCode' in err ? err.statusCode : undefined;
      const code = 'code' in err ? err.code : undefined;
      if (status === 409 || code === 11000) {
        res.status(409).json({ message: err.message || 'An account already uses that email.' });
        return;
      }`}
    }
    next(err);
  }
}

export async function login(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}, next${isTs ? ': NextFunction' : ''})${isTs ? ': Promise<void>' : ''} {
  const { email, password } = req.body ?? {};
  if (
    typeof email !== 'string' || !email.trim() || email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' || !password || Buffer.byteLength(password) > 72
  ) {
    res.status(400).json({ message: 'Invalid email or password format.' });
    return;
  }

  try {
    const result = await authenticateUser({ email: email.trim(), password });
    res.cookie(cookieName, result.token, { ...cookieOptions, maxAge: 3600000 });
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: result.user,
      token: result.token
    });
  } catch (err${isTs ? ': unknown' : ''}) {
    if (err && typeof err === 'object') {
${isTs ? `      const errorObj = err as { statusCode?: number; message?: string };
      if (errorObj.statusCode === 401) {
        res.status(401).json({ message: errorObj.message || 'Invalid email or password.' });
        return;
      }` : `      const status = 'statusCode' in err ? err.statusCode : undefined;
      if (status === 401) {
        res.status(401).json({ message: err.message || 'Invalid email or password.' });
        return;
      }`}
    }
    next(err);
  }
}

export function getMe(req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''})${isTs ? ': void' : ''} {
  const user = req.user || res.locals.user;
  res.status(200).json({ success: true, user });
}

export function logout(_req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''})${isTs ? ': void' : ''} {
  res.clearCookie(cookieName, cookieOptions);
  res.sendStatus(204);
}

export const authenticate = (isSignup${isTs ? ': boolean' : ''}) => (isSignup ? signup : login);
`;

  // An atomic MongoDB update owns the counter and its reset time across replicas.
  files[`src/config/loginLimit.${ext}`] = `import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';

const windowMs = 15 * 60_000;
const mode = process.env.LOGIN_LIMIT_STORE || 'memory';
if (!['memory', 'mongo'].includes(mode)) throw new Error('LOGIN_LIMIT_STORE must be memory or mongo');

function counters() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Login limiter requires a database connection');
  return db.collection${isTs ? '<{ _id: string; hits: number; resetTime: Date }>' : ''}('auth_rate_limits');
}

export async function prepareLoginLimit() {
  if (mode === 'mongo') await counters().createIndex({ resetTime: 1 }, { expireAfterSeconds: 0 });
}

const store = {
  async increment(key${isTs ? ': string' : ''}) {
    const expired = { $lte: [{ $ifNull: ['$resetTime', new Date(0)] }, '$$NOW'] };
    const result = await counters().findOneAndUpdate({ _id: key }, [{ $set: {
      hits: { $cond: [expired, 1, { $add: ['$hits', 1] }] },
      resetTime: { $cond: [expired, { $add: ['$$NOW', windowMs] }, '$resetTime'] }
    } }], { upsert: true, returnDocument: 'after' });
    if (!result) throw new Error('Could not record login attempt');
    return { totalHits: result.hits, resetTime: result.resetTime };
  },
  async decrement(key${isTs ? ': string' : ''}) {
    await counters().updateOne({ _id: key, hits: { $gt: 0 } }, { $inc: { hits: -1 } });
  },
  async resetKey(key${isTs ? ': string' : ''}) {
    await counters().deleteOne({ _id: key });
  }
};

export const loginLimit = rateLimit({
  windowMs, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
  store: mode === 'mongo' ? store : undefined,
  message: { message: 'Too many attempts. Try again later.' }
});

export const authRateLimit = loginLimit;
`;

  // 7. Auth Routes: src/routes/auth.routes.{js,ts}
  files[`src/routes/auth.routes.${ext}`] = `import { Router } from 'express';
import { loginLimit } from '../config/loginLimit.js';
import { signup, login, getMe, logout } from '../controllers/auth.controller${importExt}';
import { requireToken } from '../middlewares/requireToken${importExt}';

const router = Router();
router.post('/signup', loginLimit, signup);
router.post('/login', loginLimit, login);
router.get('/me', requireToken, getMe);
router.post('/logout', logout);
export default router;
`;
}
