# QuickBite backend (demo)

This small Express backend stores contact messages and users in JSON files under `server/data/`.

Setup (Windows PowerShell):

1. Open a terminal in `c:\Users\jathin\OneDrive\Desktop\quickbite\server`
2. Install dependencies:

```powershell
npm install
```

3. Start server:

```powershell
npm start
```

By default the server listens on port 3000. You can change the port by setting the `PORT` environment variable before running the start command.

MongoDB support
----------------
This backend now uses MongoDB (via Mongoose) instead of storing data in JSON files. To use MongoDB locally:

1. Start a MongoDB server (e.g. `mongod` or use a local Docker container).
2. By default the backend will connect to `mongodb://localhost:27017/quickbite`. To change it, set the `MONGO_URI` environment variable before starting the server.

Example (PowerShell):

```powershell
$env:MONGO_URI = 'mongodb://localhost:27017/quickbite'
npm start
```

The following env vars are respected:
- `PORT` - port to listen on (default 3000)
- `MONGO_URI` - MongoDB connection string (default mongodb://localhost:27017/quickbite)
- `JWT_SECRET` - secret used to sign demo JWT tokens (default in-dev secret)

Dev debug endpoints still exist and now read directly from MongoDB:

- GET /api/_debug/contacts
- GET /api/_debug/users

Notes
- This is still a demo backend. For production you should secure the JWT secret, enable HTTPS, and use a managed database with proper user access controls.

Available endpoints (demo):

- POST /api/contact  -- { name, email, message } -> stores to `server/data/contacts.json`
- POST /api/register -- { name, email, password, phone? } -> stores to `server/data/users.json` (password hashed)
- POST /api/login    -- { email, password } -> returns token on success
- GET  /api/health   -- health check

Dev endpoints:
- GET /api/_debug/contacts
- GET /api/_debug/users

Notes:
- This is a demo backend intended for local development only. It stores data in flat JSON files and is not intended for production use.
- For production, replace storage with a proper database and secure the JWT secret via environment variables.
