# X-Ray System - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for all packages in the monorepo.

### 2. Build All Packages

```bash
npm run build
```

This compiles TypeScript for all packages.

### 3. Generate Demo Data

```bash
npm run demo
```

This runs the demo application and creates sample executions in the database.

### 4. Start Services

In separate terminals:

**Terminal 1 - API Server:**
```bash
npm run server
```
Server runs on http://localhost:3001

**Terminal 2 - Dashboard:**
```bash
npm run dashboard
```
Dashboard runs on http://localhost:5173

Or use concurrently to run both:
```bash
npm run dev
```

### 5. View Results

Open http://localhost:5173 in your browser to view the dashboard.

## Development Mode

For development with hot reloading:

```bash
# Terminal 1: API server with nodemon
cd packages/server
npm run dev

# Terminal 2: Dashboard with Vite HMR
cd packages/dashboard
npm run dev

# Terminal 3: Run demo (when needed)
cd packages/demo
npm run dev
```

## Production Build

```bash
# Build all packages
npm run build

# Start production server
cd packages/server
npm start

# Build and serve dashboard
cd packages/dashboard
npm run build
npm run preview
```

## Troubleshooting

### Database Issues

If you encounter database errors:
- Delete `packages/server/data/xray.db` and restart
- Ensure write permissions in `packages/server/data/` directory

### Port Conflicts

If ports 3001 or 5173 are in use:
- Set `PORT` environment variable for server
- Modify `vite.config.ts` for dashboard port

### Type Errors

If TypeScript errors occur:
- Run `npm run build` to ensure all packages are compiled
- Check that workspace dependencies are installed: `npm install`

### Import Errors

If imports fail:
- Ensure all packages are built: `npm run build`
- Check that workspace links are correct: `npm ls`

## Environment Variables

Create a `.env` file in the root:

```env
PORT=3001
NODE_ENV=development
DB_PATH=packages/server/data/xray.db
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
xray-system/
├── packages/
│   ├── sdk/          # X-Ray SDK (library)
│   ├── server/       # API server + SQLite store
│   ├── dashboard/    # React dashboard UI
│   └── demo/         # Demo application
├── package.json      # Root workspace
└── README.md         # Main documentation
```

## Next Steps

1. Review the [README.md](README.md) for detailed documentation
2. Check the demo app code in `packages/demo/src/` for usage examples
3. Explore the dashboard UI to see X-Ray data visualization
4. Integrate the SDK into your own applications

