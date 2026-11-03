# create-modern-mern-app

An interactive npm CLI that creates a React and Express workspace with working authentication, a shadcn/ui dashboard, and a landing page for testing the API. The frontend and backend can each use JavaScript or TypeScript.

Open `handbook/dist/index.html` for the setup guide and API reference. To deploy the static handbook on Vercel, set the project root to `handbook/dist`, use the Other framework preset, and leave the build command empty.

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

### Provision an administrator

Create the account normally, then change its role to admin using a trusted database administration workflow. Open /dashboard/members to see the 50 most recent accounts. Members get a 403 from the API even if they enter the URL directly. Role changes take effect on the next protected request. Avoid accepting a role from a signup form.

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

Multer adds upload middleware. With authentication enabled, the generated POST /api/upload route accepts a multipart field named file (5 MB maximum). Without authentication, wire the middleware only after choosing an access policy. Cloudinary adds SDK configuration. Nodemailer adds an SMTP helper. Selecting Cloudinary or Nodemailer alone does not expose a public endpoint. Redux adds a counter demo and Toastify adds a notification test to the landing page.

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

Run `npm ci`, `npm test` and `npm run lint` in this repository. Run `npm run test:packed` to install the actual tarball and build, lint and test the default, Tailwind and plain-CSS starters. Set `TEST_MONGO_URI` to a test MongoDB service to exercise the database-backed flows. The registry components and their MIT notice ship with the CLI. To read the five-page handbook offline, open `handbook/dist/index.html` in the checkout.

## Deployment checks

| Symptom | Check |
| --- | --- |
| Refreshing a dashboard URL on Vercel gives 404 | Configure a SPA fallback to index.html. If using a same-origin API proxy, match /api before the fallback. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) |
| Client keeps calling an old API | Rebuild after changing VITE_API_URL. Browser-exposed VITE_ variables are compiled into the bundle. [Vite environment documentation](https://vite.dev/guide/env-and-mode) |
| MongoDB works locally but connection fails on the host | Check the host’s outbound IP against the Atlas access list, database credentials and URI encoding. [Atlas troubleshooting](https://www.mongodb.com/docs/atlas/troubleshoot-connection/) |
| Many users hit the same login limit | Check how the reverse proxy forwards the client IP. Configure Express trust proxy only for your actual trusted hops. For multiple replicas, set LOGIN_LIMIT_STORE=mongo on every instance and point them at the same MongoDB database. Set TRUSTED_PROXY_CIDRS only to verified ingress addresses. [Proxy troubleshooting](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues) |
| Uploaded files disappear after redeploy | Store uploads on persistent disk or in object storage before using the example upload route in production. [Render filesystem behavior](https://render.com/docs/disks) |

Run npm test in the generated project for API and security-header checks. Auth-enabled apps also run signup, role and session integration tests when TEST_MONGO_URI points at a test MongoDB service.

The authenticated starter loads login, signup and dashboard code on navigation. To check this in a production build, open the landing page with the browser Network panel filtered to JavaScript, then navigate to the dashboard.

If a route chunk disappears after a release, the starter offers a refresh on the current URL. Configure the host to revalidate index.html with `Cache-Control: no-cache` and serve fingerprinted assets under /assets/ with long-lived caching. Retaining previous release assets during rollout also helps sessions already in progress.

The default packed-starter CI job runs Chrome on the production build. To repeat it locally, install Chrome with `npx playwright install chrome`, set `TEST_BROWSER=1` and `TEST_MONGO_URI` for a test MongoDB service in your shell, and run `npm run test:packed -- default`. Playwright is a development dependency of the generator only.

### Scaling authentication

The default in-memory limit is 30 combined login and signup attempts per client IP in 15 minutes. To share it, set `LOGIN_LIMIT_STORE=mongo` on every replica. All replicas must use the same database and signing secret. The API creates a TTL index on `auth_rate_limits.resetTime` during startup. Grant the deployment account permission to create that index. Expiry is enforced during the atomic counter update even while expired documents await deletion. A store error fails the request rather than giving the caller a fresh allowance.

## Automatic npm releases

Push your changes to main. After the repository checks and packed-starter matrix pass, GitHub Actions bumps the patch version in both npm manifests, pushes the release commit and matching Git tag together, and publishes the tarball under latest. Pull requests run checks only. If several pushes arrive together, the current main tip owns the release.

For npm authentication, register a GitHub Actions trusted publisher in the npm package settings for owner MArsalanwarsi, repository create-modern-mern-app, and workflow filename publish.yml. Alternatively, configure the GitHub Actions secret NPM_TOKEN with publication rights for this package. Repository rules must allow the workflow to push the release commit to main and create the version tag.

If npm publication fails after the Git push, fix the reported error and rerun the failed job. The workflow reuses the tagged version and verifies the checksum if npm already accepted it. After an automatic release, pull main before making your next push.

After publication, the release job verifies the public `@latest` CLI in an empty project with a fresh npm cache on each attempt. Check **Verify public install** and the run summary for the observed version. If verification times out, rerun the failed job to recheck the existing release.
