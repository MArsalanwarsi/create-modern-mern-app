// Express 5 forwards rejected async handlers to the generated error middleware.
export function addAuthServer(files, isTs) {
  const ext = isTs ? 'ts' : 'js';
  const handler = isTs ? ': RequestHandler' : '';
  const types = isTs ? "import type { RequestHandler } from 'express';\n" : '';
  files[`src/models/user.model.${ext}`] = `import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['member', 'admin'], default: 'member' }
}, { timestamps: true });

export const User = mongoose.model('User', schema);
`;
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
  files[`src/middlewares/requireToken.${ext}`] = `${types}import { cookieName, verifyToken } from '../config/session.js';
import { User } from '../models/user.model.js';

export const requireToken${handler} = async (req, res, next) => {
  const cookie = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(cookieName + '='));
  let subject;
  try {
    const payload = verifyToken(cookie?.slice(cookieName.length + 1) || '');
    if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.sub)) throw new Error();
    subject = payload.sub;
  } catch {
    res.status(401).json({ message: 'Sign in to continue.' });
    return;
  }
  const user = await User.findById(subject).select('name email role').lean();
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
  files[`src/controllers/auth.controller.${ext}`] = `${types}import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { issueToken, cookieName, cookieOptions } from '../config/session.js';

const dummyHash = await bcrypt.hash('timing fallback', 12);
export const authenticate = (signup${isTs ? ': boolean' : ''})${handler} => async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (typeof email !== 'string' || email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || !password || Buffer.byteLength(password) > 72 ||
      (signup && (password.length < 12 || typeof name !== 'string' || !name.trim() || name.trim().length > 100))) {
    res.status(400).json({ message: 'Check your account details. New passwords require at least 12 characters and at most 72 bytes.' });
    return;
  }
  const address = email.trim().toLowerCase();
  let user;
  if (signup) {
    try {
      user = await User.create({ name: name.trim(), email: address, passwordHash: await bcrypt.hash(password, 12) });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
        res.status(409).json({ message: 'An account already uses that email.' }); return;
      }
      throw err;
    }
  } else {
    user = await User.findOne({ email: address }).select('+passwordHash');
    const matches = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
    if (!user || !matches) { res.status(401).json({ message: 'Invalid email or password.' }); return; }
  }
  res.cookie(cookieName, issueToken(String(user._id)), { ...cookieOptions, maxAge: 3600000 });
  res.status(signup ? 201 : 200).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};
`;
  files[`src/routes/auth.routes.${ext}`] = `import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '../controllers/auth.controller.js';
import { requireToken } from '../middlewares/requireToken.js';
import { cookieName, cookieOptions } from '../config/session.js';

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
