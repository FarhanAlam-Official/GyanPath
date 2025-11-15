# Testing Setup Guide

## Issue Fixed

The error `Cannot find module '@swc/core'` has been resolved by:
1. Adding `@swc/core` to `devDependencies` in `package.json`
2. Simplifying `jest.config.js` to let Next.js handle transformation automatically
3. All testing dependencies are now properly listed in `package.json`

## Installation

To install all testing dependencies, run:

```bash
npm install
```

If Jest is still not found after installation, try:

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

Or on Windows PowerShell:

```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## Verify Installation

After installation, verify Jest is working:

```bash
npx jest --version
```

Should output: `29.7.0` (or similar)

## Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npm test -- __tests__/setup.test.ts
```

## Troubleshooting

### Jest command not found

If you get `'jest' is not recognized as an internal or external command`:

1. **Verify Jest is installed:**
   ```bash
   npm list jest
   ```

2. **Check node_modules/.bin:**
   ```bash
   ls node_modules/.bin/jest.cmd  # Windows
   ls node_modules/.bin/jest      # Unix/Mac
   ```

3. **Reinstall Jest:**
   ```bash
   npm install --save-dev jest jest-environment-jsdom
   ```

### Module resolution errors

If you get module resolution errors:

1. **Check tsconfig.json paths:**
   - Ensure `"@/*": ["./*"]` is in `compilerOptions.paths`

2. **Check jest.config.js:**
   - Ensure `moduleNameMapper` matches tsconfig paths

### SWC errors

If you get SWC-related errors:

1. **Verify @swc/core is installed:**
   ```bash
   npm list @swc/core
   ```

2. **Reinstall:**
   ```bash
   npm install --save-dev @swc/core @swc/jest
   ```

## Dependencies

The following testing dependencies are required:

- `jest` - Test framework
- `jest-environment-jsdom` - DOM environment for tests
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `@swc/core` - Fast TypeScript compiler (required by @swc/jest)
- `@swc/jest` - SWC transformer for Jest
- `@types/jest` - TypeScript types for Jest

All are listed in `package.json` under `devDependencies`.

## Next Steps

1. Install dependencies: `npm install`
2. Run the setup test: `npm test -- __tests__/setup.test.ts`
3. Review test files in `__tests__/` directory
4. Start writing your own tests!

For more information, see [TESTING.md](./TESTING.md).

