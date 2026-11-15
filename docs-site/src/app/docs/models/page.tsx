import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, Database, Key, Shield } from "lucide-react";

export const metadata = {
  title: "Models & Database Schemas | create-modern-mern-app Documentation",
  description: "Comprehensive guide to Mongoose schemas, user models, role validation, and password security."
};

export default function ModelsPage() {
  return (
    <article className="space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
          Data Layer Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Models & Database Schemas
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          Understanding the Mongoose user schema, role-based access control, indexing, and projection security.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">1. User Schema Definition (`server/src/models/user.model.js`)</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          The User model manages identity, secure password hashes, and access privileges. It is strictly typed and indexed for high-volume reads:
        </p>

        <CodeBlock
          title="User Model Schema"
          language="typescript"
          code={`import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'member' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false // Excluded by default from database queries
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);`}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">2. Schema Field Specifications</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface/60 border-b border-border/80 text-foreground font-bold">
              <tr>
                <th className="p-3">Field</th>
                <th className="p-3">Type</th>
                <th className="p-3">Validation / Constraints</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-muted">
              <tr>
                <td className="p-3 font-mono font-medium text-foreground">name</td>
                <td className="p-3">String</td>
                <td className="p-3">Required, max 100 chars, trimmed</td>
                <td className="p-3">User display name rendered in the dashboard nav</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-medium text-foreground">email</td>
                <td className="p-3">String</td>
                <td className="p-3">Required, unique, lowercase, regex-checked</td>
                <td className="p-3">Login identifier, unique database index</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-medium text-foreground">password</td>
                <td className="p-3">String</td>
                <td className="p-3">bcrypt hash (10 salt rounds), select: false</td>
                <td className="p-3">Never returned in API responses or user listings</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-medium text-foreground">role</td>
                <td className="p-3">String</td>
                <td className="p-3">Enum: [&apos;member&apos;, &apos;admin&apos;], default: &apos;member&apos;</td>
                <td className="p-3">Enforces authorization boundaries via requireRole</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Security Invariants & Projections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Key className="w-4 h-4 text-primary" />
              Password Redaction
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Database queries exclude password hashes by default. Controllers explicitly use projection safe helpers (<code>getUserById</code>) returning only <code>_id, name, email, role, createdAt</code>.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Shield className="w-4 h-4 text-primary" />
              Role Protection
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              New registrations always default to <code>member</code>. Admin escalation cannot be passed via the request body during signup.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border/80 flex justify-between items-center">
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quickstart
        </Link>
        <Link
          href="/docs/auth"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity transition-colors"
        >
          Dual-Token Auth
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
