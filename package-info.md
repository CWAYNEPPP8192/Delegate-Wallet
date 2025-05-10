# Package Information for GitHub Repository

When setting up your GitHub repository, you may want to update your package.json with the following information:

```json
{
  "name": "ai-delegated-group-wallet",
  "version": "1.0.0",
  "description": "AI-enhanced web application for managing delegated group wallets using MetaMask's ERC-7715 Delegation Toolkit",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/ai-delegated-group-wallet.git"
  },
  "keywords": [
    "blockchain",
    "wallet",
    "delegation",
    "ethereum",
    "react",
    "express",
    "openai",
    "ai",
    "web3"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

## Recommended NPM Scripts

Consider adding these scripts to your package.json after pushing to GitHub:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "vitest run",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

Note: You would need to install ESLint, Prettier, and Vitest to use these scripts.