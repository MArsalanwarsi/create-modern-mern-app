# create-modern-mern-app

An interactive npm CLI that creates a React and Express workspace with working authentication, a shadcn/ui dashboard, and a landing page for testing the API. The frontend and backend can each use JavaScript or TypeScript.

Open `handbook/dist/index.html` for the setup guide and API reference. To deploy the static handbook on Vercel, set the project root to `handbook/dist`, use the Other framework preset, and leave the build command empty.

## Quick start

Use Node.js **24.16+**, npm and a running MongoDB service or Atlas database.

```sh
npx create-modern-mern-app@latest my-app
cd my-app
npm run dev
```

If you skip installation in the wizard, run `npm install` at the generated root first. The generator writes a development secret to `server/.env`. Set `MONGO_URI` there if you use Atlas. Open **http://localhost:3000**, run **Check API health**, then create an account. The server listens on **http://localhost:5000**.

To try the generator from source, run `npm ci` in the generator checkout and invoke `node bin/index.js <new-directory>`.

## What the wizard installs

| Included in every app | Optional |
| --- | --- |
| Vite, React Router, Tailwind, shadcn/ui login, signup and sliced dashboard, Axios | React Compiler, Redux Toolkit, React-Toastify |
| Express, MongoDB/Mongoose, bcryptjs, jsonwebtoken, token and role middleware | CORS, dotenv, Multer, Cloudinary, Nodemailer |
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

### Provision an administrator

Create the account normally, then change its role to admin using a trusted database administration workflow. Role changes take effect on the next protected request. Avoid accepting a role from a signup form.

## API reference

### The Axios instance

client/src/api/client exports api and errorMessage. The instance uses /api by default, sends credentials and adds X-Requested-With: mern-client. The server requires that header for writes. Vite proxies /api to port 5000 during development.

```js
import { api } from './api/client';

const { data } = await api.get('/health');
await api.post('/auth/login', { email, password });
```

### Endpoints

GET /health returns public service status. POST /auth/signup returns 201, POST /auth/login returns 200, GET /auth/me returns the current user and POST /auth/logout returns 204. GET /users lists up to 50 accounts for administrators. All paths are relative to /api.

### Optional integrations

Multer adds an authenticated POST /api/upload route accepting a multipart field named file (5 MB maximum). Cloudinary adds SDK configuration. Nodemailer adds an SMTP helper. Selecting Cloudinary or Nodemailer alone does not expose a public endpoint. Redux adds a counter demo and Toastify adds a notification test to the landing page.

## Operations

### Commands

From the generated root use these commands. The TypeScript server emits dist/index.js. The JavaScript server runs index.js directly.

```text
npm install       # install both workspaces
npm run dev       # run Vite and Express
npm run lint      # Oxlint both workspaces
npm run build     # build client and check/build server
npm --prefix server start
```

### Production

Serve client/dist with a history fallback to index.html. Forward /api to the server on the same HTTPS origin. Set NODE_ENV=production, MONGO_URI and a stable, high-entropy JWT_SECRET in the host environment. Secure cookies require HTTPS. VITE_API_URL is a frontend build-time setting. For separate same-site origins enable the CORS add-on and set CLIENT_ORIGIN to the exact trusted frontend origin.

### Troubleshooting

If install fails, check Node and npm versions, registry connectivity and disk space, then rerun npm install at the root. If /api/health fails, inspect the server output and MongoDB connection. For 401, sign in again. For 403, check the role or request header. For 429, wait for the rate-limit window to expire.

## Work on the generator

Run `npm ci`, `npm test`, `npm run lint`, and `npm pack --dry-run` in this repository. The registry components and their MIT notice ship with the CLI. To read the five-page handbook offline, open `handbook/dist/index.html` in the checkout.
