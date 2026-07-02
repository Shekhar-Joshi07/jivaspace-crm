# Complete CRM Frontend

Responsive React and Vite client for the Complete CRM backend.

## Features

- JWT session restoration and protected routes
- Role-aware navigation for Superadmin, Admin, and Business Executive
- Dashboard metrics, pipeline/status charts, and recent activity
- Searchable and paginated lead management
- Lead detail hub with notes, call logs, activities, files, tasks, email, and SMS
- Drag-and-drop sales pipeline
- Task filters, overdue states, reminders, assignment, and completion
- Reports for conversion, pipeline, tasks, sources, users, monthly leads, and revenue
- Spreadsheet import and export
- Notifications inbox
- User/team administration
- Password reset and account settings
- Mobile sidebar, loading, empty, validation, error, modal, and toast states

## Local setup

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` to the backend API, including `/api`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

If the existing backend `.env` uses port `3030`, set the frontend value to `http://localhost:3030/api`.

From the project root, `npm run frontend` starts the client and `npm run server` starts the backend.

## Routes

| Route | Access |
| --- | --- |
| `/login`, `/register`, `/forgot-password` | Public |
| `/` | All CRM roles |
| `/leads`, `/leads/:id`, `/pipeline` | All CRM roles, with scoped controls |
| `/tasks` | All CRM roles |
| `/notifications`, `/settings` | All CRM roles |
| `/reports` | Superadmin, Admin |
| `/users` | Superadmin, Admin |

## Validation

```powershell
npm test
npm run build
npm audit --omit=dev
```

The production build is written to `client/dist`.

## Deploy on Render

1. Create a Render Static Site and choose this repository.
2. Set the root directory to `client`.
3. Use `npm ci && npm run build` as the build command.
4. Use `dist` as the publish directory.
5. Add `VITE_API_URL=https://your-backend.onrender.com/api` as an environment variable before building.
6. Add a rewrite from `/*` to `/index.html` so React Router routes work on refresh.
7. Add the deployed frontend origin to the backend `CLIENT_URL` variable and redeploy the API.

The MongoDB Atlas configuration belongs to the backend; the browser never receives database credentials or JWT secrets.
