import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, Shield, Globe, Lock } from "lucide-react";

export const metadata = {
  title: "REST API Reference | create-modern-mern-app Documentation",
  description: "Complete HTTP REST API reference for authentication, user profiles, and member directories."
};

export default function ApiReferencePage() {
  return (
    <article className="space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
          HTTP Transport Contracts
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          API Reference
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          Comprehensive specification of all endpoints, request payloads, response bodies, and error conditions.
        </p>
      </div>

      {/* Endpoints overview table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Endpoints Overview</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface/60 border-b border-border/80 text-foreground font-bold">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Auth Scope</th>
                <th className="p-3">Rate Limit</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-muted font-mono text-xs">
              <tr>
                <td className="p-3 text-emerald-500 font-bold">POST</td>
                <td className="p-3 text-foreground font-medium">/api/auth/signup</td>
                <td className="p-3 text-text-muted">Public</td>
                <td className="p-3">10 req / 15m</td>
                <td className="p-3 font-sans text-xs">Register account, receive session cookie and JWT</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-500 font-bold">POST</td>
                <td className="p-3 text-foreground font-medium">/api/auth/login</td>
                <td className="p-3 text-text-muted">Public</td>
                <td className="p-3">10 req / 15m</td>
                <td className="p-3 font-sans text-xs">Verify credentials and issue session cookie</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-500 font-bold">GET</td>
                <td className="p-3 text-foreground font-medium">/api/auth/me</td>
                <td className="p-3 text-amber-500">Bearer / Cookie</td>
                <td className="p-3">None</td>
                <td className="p-3 font-sans text-xs">Returns active authenticated user record</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-500 font-bold">POST</td>
                <td className="p-3 text-foreground font-medium">/api/auth/logout</td>
                <td className="p-3 text-text-muted">Public</td>
                <td className="p-3">None</td>
                <td className="p-3 font-sans text-xs">Clears HTTP-only session cookie</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-500 font-bold">GET</td>
                <td className="p-3 text-foreground font-medium">/api/users</td>
                <td className="p-3 text-rose-500 font-bold">Admin Only</td>
                <td className="p-3">None</td>
                <td className="p-3 font-sans text-xs">Returns list of registered team members</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* POST /api/auth/signup */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-xs font-bold">
            POST
          </span>
          <span className="font-mono text-base font-semibold text-foreground">/api/auth/signup</span>
        </div>
        <p className="text-sm text-text-muted">Creates a new member account, hashes password with bcryptjs, and sets an HTTP-only session cookie.</p>

        <CodeBlock
          title="Request Body (application/json)"
          language="json"
          code={`{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}`}
        />

        <CodeBlock
          title="Response (201 Created)"
          language="json"
          code={`{
  "user": {
    "id": "6735e076b4a2c1b827e8d531",
    "name": "Jane Developer",
    "email": "jane@example.com",
    "role": "member"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
        />
      </div>

      {/* GET /api/users */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 font-mono text-xs font-bold">
            GET
          </span>
          <span className="font-mono text-base font-semibold text-foreground">/api/users</span>
        </div>
        <p className="text-sm text-text-muted">Protected administrative route that lists registered members. Returns HTTP 403 Forbidden if current role is not admin.</p>

        <CodeBlock
          title="Request Headers"
          language="bash"
          code={`GET /api/users HTTP/1.1
Host: localhost:5000
Authorization: Bearer <ADMIN_JWT_TOKEN>
X-Requested-With: mern-client`}
        />

        <CodeBlock
          title="Response (200 OK)"
          language="json"
          code={`[
  {
    "_id": "6735e076b4a2c1b827e8d531",
    "name": "Jane Developer",
    "email": "jane@example.com",
    "role": "member",
    "createdAt": "2026-11-14T10:00:00.000Z"
  },
  {
    "_id": "6735e076b4a2c1b827e8d532",
    "name": "Lead Admin",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-11-13T09:00:00.000Z"
  }
]`}
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/80">
        <Link
          href="/docs/production"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Production Hardening
        </Link>
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity transition-colors"
        >
          Quickstart & Setup
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
