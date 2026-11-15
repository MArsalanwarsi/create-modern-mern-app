<div align="center">
  <img src="assets/logo.svg" alt="create-modern-mern-app logo" width="128" height="128" />

  # create-modern-mern-app

  <p><strong>Interactive CLI generator for production-ready MERN applications.</strong></p>
  <p>Engineered with React 19, Express 5, Vite, MongoDB, and official shadcn/ui models.</p>

  <p>
    <a href="https://www.npmjs.com/package/create-modern-mern-app"><img src="https://img.shields.io/npm/v/create-modern-mern-app.svg?style=flat-square&color=38bdf8" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/create-modern-mern-app"><img src="https://img.shields.io/npm/dm/create-modern-mern-app.svg?style=flat-square&color=34d399" alt="npm downloads" /></a>
    <a href="https://github.com/MArsalanwarsi/create-modern-mern-app/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://create-modern-mern-app.vercel.app"><img src="https://img.shields.io/badge/documentation-online-090a0c.svg?style=flat-square" alt="Documentation Portal" /></a>
  </p>

  <p>
    <a href="https://create-modern-mern-app.vercel.app"><strong>Explore Documentation & Model Guides »</strong></a>
  </p>
</div>

---

An interactive npm CLI that creates a full-stack React and Express workspace with working authentication, an authentic shadcn/ui dashboard, and a landing page for testing the API. The frontend and backend can each use JavaScript or TypeScript.

Visit the live documentation and architectural handbook at **[https://create-modern-mern-app.vercel.app](https://create-modern-mern-app.vercel.app)** for in-depth setup instructions, database models, and API reference.

## Quick start

Use Node.js **24.16+**, npm and a running MongoDB service or Atlas database.

```sh
npx create-modern-mern-app@latest my-app
cd my-app
npm install    # if you skipped installation in the wizard
npm run dev
```

If you skip installation in the wizard, run `npm install` at the generated root first. When authentication is enabled, the generator writes a development signing secret to `server/.env`. Set `MONGO_URI` there if you use Atlas. Open **http://localhost:3000**, run **Check API health**, then create an account. The server listens on **http://localhost:5000**.

To try the generator from source, run `npm ci` in the generator checkout and invoke `node bin/index.js <new-directory>`.

For an unattended setup, pass `--yes` with explicit choices:

```sh
npx create-modern-mern-app@latest portal --yes --language ts --styling tailwind --auth --install
npx create-modern-mern-app@latest brochure --yes --language js --styling css --no-auth --no-install
```

The shadcn preset includes the New York [login-01](https://ui.shadcn.com/view/new-york-v4/login-01), [signup-01](https://ui.shadcn.com/view/new-york-v4/signup-01) and [dashboard-01](https://ui.shadcn.com/view/new-york-v4/dashboard-01) blocks. Its dashboard uses the registry's demonstration metrics, chart and table. The account menu shows the signed-in user, **Log out** ends the session, and **Team** opens the admin-only database-backed members directory. Google sign-in and password recovery are visual placeholders from the registry. The API enforces a 12-character signup minimum.

## What the wizard installs

| Included in every app | Optional |
| --- | --- |
| Vite, React Router, Axios | shadcn/ui, Tailwind-only or plain CSS, React Compiler, Redux Toolkit, React-Toastify |
| Express, MongoDB/Mongoose, Helmet security headers | JWT cookie auth with bcryptjs and token/role middleware, CORS, dotenv, Multer, Cloudinary, Nodemailer |
| Root npm workspaces, concurrent development scripts, Oxlint | Install now or later |

## Project structure

### Workspace

The root package manages client and server as npm workspaces. Commit the root package-lock.json after installing. Use npm ci on subsequent clean checkouts.

```text
client/src/api/          Shared Axios client
client/src/components/   Auth form and shadcn/ui primitives
client/src/layout/       Website and dashboard shells
client/src/layout/slices/  Sidebar, header, navbar and footer
client/src/pages/        Website, auth and dashboard screens
server/index.js          Server entry (index.ts for TypeScript)
server/src/              Models, controllers, routes, config and middleware
```

### Add a dashboard page

Create a component under client/src/pages/dashboard. Add a child Route inside the /dashboard route in App and a link in the Sidebar slice. The layout renders its active child through Outlet.

### Add a backend feature

Define a Mongoose model, put request handling in a controller and register the endpoint in src/routes. Place requireToken before any handler that needs an account. For TypeScript server modules, use .js on relative imports so the emitted NodeNext modules resolve.

## Authentication

### Create a session

POST /api/auth/signup accepts name, email and password. POST /api/auth/login takes email and password. bcryptjs hashes passwords. Both routes issue a one-hour JWT inside an HTTP-only cookie. Signup always creates a member. Login attempts and signups share a per-IP rate limit.

### Protect a route

requireToken verifies the signature, expiry and issuer, then loads the current user. requireRole checks that user's database role. Anonymous requests receive 401 and signed-in users without the required role receive 403.

```js
router.get('/users', requireToken, requireRole('admin'), getUsers);
```

### Sign out

POST /api/auth/logout clears the browser cookie. GET /api/auth/me returns the signed-in user. Signing out clears that browser session. A copied token remains valid until its one-hour expiry.

## Testing

Verify the generator using the automated test suite and Oxlint:

```sh
npm test
npm run lint
```

## Documentation

Full interactive documentation portal and architectural guides are maintained in `docs-site/` and live at **[https://create-modern-mern-app.vercel.app](https://create-modern-mern-app.vercel.app)**.

## License

MIT © [Muhammad Arsalan Warsi](https://github.com/MArsalanwarsi)
