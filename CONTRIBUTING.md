# Contributing to X-Ray

Thank you for your interest in contributing to the X-Ray Decision Transparency System!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build all packages:
   ```bash
   npm run build
   ```
4. Run development servers:
   ```bash
   npm run dev
   ```

## Project Structure

This is a monorepo with the following packages:

- `packages/sdk` - Core SDK library
- `packages/server` - API server
- `packages/dashboard` - React dashboard
- `packages/demo` - Demo application

## Development Workflow

1. Make changes in the relevant package
2. Build the package: `npm run build --workspace=packages/<package>`
3. Test your changes
4. Ensure all packages build: `npm run build`

## Code Style

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Follow existing code patterns
- Add JSDoc comments for public APIs

## Testing

Run tests (when implemented):
```bash
npm test
```

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Ensure all builds pass
4. Update documentation if needed
5. Submit PR with clear description

## Questions?

Open an issue for questions or discussions.

