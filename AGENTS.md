# Working on create-modern-mern-app

This repository contains the JavaScript ESM source for an npm CLI that generates a MERN application. Keep the generator, the generated application, and the static documentation site distinct when choosing where to make a change. Use Node.js 24.16 or newer and npm. Read the checkout version from `package.json`. Resolve the published version from npm when it matters.

## CLI behavior and visual direction

- `bin/index.js` handles help, version, the Node minimum and startup errors. `src/cli.js` parses flags, runs the Clack wizard and passes one configuration to the generators.
- Preserve the Vite-style terminal experience. Use the compact product/version header, neutral option labels, a restrained selection indicator, and one direct question at a time. Finish with the commands the user still needs. Keep the header and command formatting in `src/ui/banner.js` and `src/ui/summary.js`.
- Exercise both interactive and unattended entry points. The wizard supports `--language` (`js`, `js-compiler`, `ts`, `ts-compiler`), `--styling` (`shadcn`, `tailwind`, `css`), `--auth` / `--no-auth`, and `--install` / `--no-install`. The language selection also determines the server language.
- `--yes` defaults to TypeScript with React Compiler, shadcn/ui, authentication, Toastify, CORS and dotenv. Pass `--install` for unattended dependency installation. Use `node bin/index.js --help` for invocation details.
- Preserve cancellation, directory collision checks, package-name sanitization, and paths containing spaces. See `src/utils/naming.js` and `src/utils/fs-helpers.js`. A new scaffold starts without a Git repository or commits.

## Generator map

| Area | Source and responsibility |
| --- | --- |
| Workspace | `src/generator/rootGenerator.js` writes the private npm workspace manifest, root scripts, ignore rules and a README tailored to the selected options. `installer.js` runs one cross-platform installation from the workspace root. |
| Client | `src/generator/clientGenerator.js` writes the Vite configuration, React entry point, public pages and routing. `authClient.js` supplies the account and protected dashboard behavior. `shadcn.js` selects bundled JS or TS templates from `shadcn-assets/`. Preserve their upstream license. |
| Server | `src/generator/serverGenerator.js` writes the Express entry point, MongoDB connection, Helmet middleware and optional integrations. `authServer.js` owns the user model, service, session and permission logic. `apiTests.js` writes executable HTTP tests into the starter. |
| Documentation | `README.md` is the npm-facing guide. `handbook/dist/` is the static handbook source for Vercel. Keep examples aligned with the generated app. The user manages site deployment. |

## Generated application contracts

1. **Structure.** Generate lowercase `client/` and `server/`. The server entry sits at `server/index.js` or `server/index.ts`; implementation modules live in `server/src/`. NodeNext server imports use explicit `.js` extensions in TS source. Use forward slashes in generated imports on every OS.
2. **Navigation.** React Router DOM is required. Layouts render their child routes through `Outlet`. Keep dashboard header and sidebar slices separate in the shadcn starter. Preserve lazy auth/dashboard routes and the user-initiated refresh fallback for missing chunks. For the shadcn preset, preserve the official New York login-01, signup-01 and dashboard-01 presentation, including sample chart and table data. Bind the account menu to the current session and Team to the protected members directory.
3. **API boundary.** Use the shared Axios instance in `client/src/api/client`. The default base is `/api`; Vite proxies development requests to Express. Write requests must send `X-Requested-With: mern-client`. Keep server secrets out of browser-exposed `VITE_` variables.
4. **Authentication.** Auth-enabled starters hash passwords with bcryptjs, assign new users the member role, and issue expiring HTTP-only JWT cookies. Keep production cookies secure. Verify sessions and current database roles on the server. `GET /api/users` requires admin access and returns only the intended member fields. Hiding a client link is insufficient authorization.
5. **Abuse controls.** Login and signup share a limit. Keep the in-memory default and the opt-in MongoDB store for multiple API replicas. Preserve atomic counting, expiry and independent client IPs. Use `TRUSTED_PROXY_CIDRS` only for verified ingress addresses.
6. **Optional features.** Keep dependencies, files, imports, route registration and README instructions consistent with each selection. Tailwind-only builds must define the theme tokens they use. Plain CSS builds must work without Tailwind. With auth disabled, omit account and protected dashboard routes. Multer can generate middleware without auth; mount the sample disk-upload endpoint only when protected. Cloudinary and Nodemailer add integration helpers.
7. **Configuration.** Generate a unique development JWT secret for auth-enabled apps, ignore real environment files, and keep `.env.example` visible to Git. Generated apps install at the root and provide `npm run dev`, `npm run build`, `npm run lint` and `npm test`.

## Verification before committing

Run these commands from the **generator repository** after changing code:

```sh
npm ci
npm test
npm run lint
```

Run `npm run test:packed` after changing generator output, dependencies, packaged assets or installation. It packs the actual CLI, installs it in a temporary consumer directory, generates the default, Tailwind and minimal starters, then installs, builds, lints and tests each. To target one case, use `npm run test:packed -- default`, `-- tailwind` or `-- minimal`. Inspect the artifact with `npm pack --dry-run` when changing package contents.

For the full auth and browser checks on Windows, start a test MongoDB service and run:

```powershell
$env:TEST_MONGO_URI = 'mongodb://127.0.0.1:27017'
$env:TEST_BROWSER = '1'
npx playwright install chrome
npm run test:packed
```

Use a dedicated test service. The database-backed checks create and remove isolated databases. The default packed case runs `scripts/test-replicas.js` and `scripts/test-browser.js` when their prerequisites are enabled. Chrome exercises the production bundle against the compiled API, including signup, login, logout, admin/member access, deferred navigation and stale-chunk recovery. Report skipped database or browser coverage explicitly. For terminal changes, also walk through the interactive wizard in a real terminal and inspect the final commands.

## CI and releases

- `.github/workflows/publish.yml` runs repository tests and Oxlint alongside the packed-starter matrix. Jobs use Ubuntu 24.04. The packed matrix uses the minimum supported Node version and a digest-pinned MongoDB service. Preserve the database health check and use the runner-assigned port. The default case also installs Chrome.
- Pull requests to `main` run checks. An authorized push to `main` can publish a new patch, including a documentation-only push. Treat a request to edit a file separately from a request to push it.
- After checks pass, `scripts/release.sh` bumps both npm manifests, atomically pushes the release commit and matching tag, and publishes the tarball. For a failed publish, fix the reported cause and rerun the failed job while that tag is current. The script can reuse the release and verify an existing tarball by integrity.
- The npm trusted publisher must match the owner, repository, `publish.yml` workflow and environment, with direct `npm publish` permission; the workflow also supports a configured `NPM_TOKEN`. Keep credentials out of source and logs.
- Confirm a release through the GitHub Actions result and the public npm registry. For installation issues, run `npx --yes create-modern-mern-app@latest --version` from an empty directory with a fresh npm cache. Pull the automated release commit before the next push.
