import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, ShieldCheck, Key, Lock, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Authentication & Middlewares | create-modern-mern-app Documentation",
  description: "Detailed guide on dual-token extraction, session cookies, Bearer auth, requireToken, and requireRole."
};

export default function AuthDocsPage() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted mb-4">
          Security & Access Control
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Authentication & Dual-Token Extraction
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          How create-modern-mern-app combines secure browser HTTP-only cookies with standard Bearer authorization headers for Postman, Thunder Client, and mobile clients.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">1. Dual-Token Architecture</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          In <code>server/src/middlewares/requireToken.js</code>, the authentication middleware inspects the incoming request with zero friction:
        </p>

        <CodeBlock
          title="requireToken Middleware"
          language="typescript"
          code={`export const requireToken = async (req, res, next) => {
  // 1. Check for standard Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  let token = (typeof authHeader === 'string' && authHeader.startsWith('Bearer '))
    ? authHeader.slice(7).trim()
    : null;

  // 2. Fall back to secure HTTP-only browser cookie
  if (!token) {
    const cookie = (req.headers.cookie || '')
      .split(';')
      .map(v => v.trim())
      .find(v => v.startsWith(cookieName + '='));
    if (cookie) token = cookie.slice(cookieName.length + 1);
  }

  if (!token) {
    res.status(401).json({ message: 'Sign in to continue.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    const rawSub = payload.sub || payload.id;
    const user = await getUserById(rawSub);
    if (!user) {
      res.status(401).json({ message: 'Account no longer exists.' });
      return;
    }

    // Attach decoded user to both req.user and res.locals.user
    req.user = user;
    res.locals.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Sign in to continue.' });
  }
};`}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">2. Role Authorization (`requireRole`)</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          The <code>requireRole</code> middleware supports both single role strings and arrays of permitted roles:
        </p>
        <CodeBlock
          title="Protecting endpoints with requireRole"
          language="javascript"
          code={`import { Router } from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { requireRole } from '../middlewares/requireRole.js';
import { getUsers } from '../controllers/api.controller.js';

const router = Router();

// Member or Admin access
router.get('/profile', requireToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Admin-only access
router.get('/users', requireToken, requireRole('admin'), getUsers);

// Multi-role access
router.get('/analytics', requireToken, requireRole(['admin', 'member']), getAnalytics);`}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Login & Registration Controllers</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Controllers return explicit developer-friendly payloads while attaching the session cookie:
        </p>
        <CodeBlock
          title="POST /api/auth/login Response Payload"
          language="json"
          code={`{
  "success": true,
  "message": "User logged in successfully",
  "user": {
    "id": "67341ad626e2a5f1e81f1234",
    "name": "Jane Developer",
    "email": "jane@example.com",
    "role": "member",
    "createdAt": "2026-11-13T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
        />
      </div>

      <div className="pt-6 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/models"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Models & Schemas
        </Link>
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
        >
          Sliced Layouts
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
