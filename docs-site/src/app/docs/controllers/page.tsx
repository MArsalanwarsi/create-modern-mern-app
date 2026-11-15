import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, Layers, ShieldCheck, Cpu } from "lucide-react";

export const metadata = {
  title: "Controllers & Services | create-modern-mern-app Documentation",
  description: "Architecture of server controllers, service layers, and business logic separation."
};

export default function ControllersPage() {
  return (
    <article className="space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
          Backend Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Controllers & Services
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          The server employs a strict separation of concerns between HTTP transport controllers and database service layers.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Architectural Responsibilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface/50 p-5 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Controllers (HTTP Layer)
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Extract and sanitize parameters from <code>req.body</code> and <code>req.cookies</code>, delegate to services, set HTTP-only response cookies, and return typed JSON contracts with appropriate status codes.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-5 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Services (Domain Layer)
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Contain business rules, execute Mongoose queries, handle password hashing via <code>bcryptjs</code>, sign JWT credentials, and ensure sensitive fields remain excluded.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Auth Controller Example (`server/src/controllers/auth.controller.ts`)</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Controllers are exported as discrete named functions for clear readability and strict type checking:
        </p>

        <CodeBlock
          title="auth.controller.ts"
          language="typescript"
          showLineNumbers={true}
          code={`import { Request, Response } from 'express';
import { signupUser, authenticateUser } from '../services/auth.service.js';

export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;
  const { user, token } = await signupUser({ name, email, password });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    user,
    token
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { user, token } = await authenticateUser({ email, password });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    user,
    token
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}`}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Auth Service Example (`server/src/services/auth.service.ts`)</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          The service handles credential verification, password hashing, and token generation:
        </p>

        <CodeBlock
          title="auth.service.ts"
          language="typescript"
          showLineNumbers={true}
          code={`import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const SALT_ROUNDS = 12;

export async function signupUser(input: Pick<IUser, 'name' | 'email' | 'password'>) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    const error: any = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: 'member'
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
}`}
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/80">
        <Link
          href="/docs/models"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          User & Auth Models
        </Link>
        <Link
          href="/docs/auth"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity transition-colors"
        >
          Dual Token & Middlewares
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
