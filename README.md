# AI-Enhanced Delegated Group Wallet

A web application for creating and managing delegated group wallets using MetaMask's ERC-7715 Delegation Toolkit, enhanced with AI-powered insights.

## Overview

This platform enables teams, DAOs, or collaborative projects to manage shared financial operations with granular permissions. The integration of AI helps analyze spending patterns, provides security insights, and offers smart delegation recommendations to optimize team financial operations.

## Features

### Core Wallet Features
- **Dynamic Permission Delegation**: Create customizable delegation chains with fine-grained permissions
- **Session-Based Access**: Delegate access for specific time periods
- **Automated Payment Streams**: Set up recurring payments without constant approval
- **Chain of Delegation**: Support for multi-level delegation hierarchies
- **Transaction Tracking**: Complete history and filtering of all wallet activities
- **Delegated Subscription Manager**: Manage recurring crypto payments with delegated permissions

### AI-Enhanced Capabilities
- **Spending Analysis**: AI-powered categorization and insights on spending patterns
- **Security Reviews**: Intelligent assessment of delegation security risks
- **Delegation Suggestions**: Smart recommendations for optimal permission assignments
- **Team Reports**: Automated, comprehensive financial reports

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Express.js, RESTful API
- **Database**: In-memory database (for development; production would use PostgreSQL)
- **AI Integration**: OpenAI GPT-4o for intelligent analysis
- **Blockchain**: MetaMask for wallet connection, ERC-7715 for delegation

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/delegated-group-wallet.git
   cd delegated-group-wallet
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── ai/        # AI-specific components
│   │   │   ├── dashboard/ # Dashboard UI components
│   │   │   ├── forms/     # Form components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx      # Main dashboard view
│   │   │   ├── Delegations.tsx    # Delegations management
│   │   │   ├── Subscriptions.tsx  # Subscription management
│   │   │   ├── TeamMembers.tsx    # Team management
│   │   │   ├── Transactions.tsx   # Transaction history
│   │   │   └── Settings.tsx       # Application settings
│   │   └── providers/     # Context providers
├── server/                # Backend Express application
│   ├── services/          # Backend services
│   │   └── aiService.ts   # AI service implementation
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage implementation
│   └── vite.ts            # Vite configuration
└── shared/                # Shared code between client and server
    └── schema.ts          # Database schema and types
```

## API Endpoints

### Wallet Management
- `POST /api/users`: Create/get user
- `GET /api/users/:address`: Get user details
- `POST /api/teams`: Create team
- `GET /api/teams`: List teams
- `POST /api/delegations`: Create delegation
- `GET /api/delegations`: List delegations
- `PATCH /api/delegations/:id`: Update delegation status

### Subscription Management
- `POST /api/subscriptions`: Create a new subscription
- `GET /api/subscriptions`: List subscriptions by team or user
- `GET /api/subscriptions/:id`: Get subscription details
- `PATCH /api/subscriptions/:id/status`: Update subscription status
- `POST /api/subscriptions/:id/increment-payment`: Track completed payments
- `POST /api/subscription-categories`: Create a subscription category
- `GET /api/subscription-categories`: List subscription categories

### AI Features
- `POST /api/ai/analyze-spending`: Get spending analysis
- `POST /api/ai/suggest-delegations`: Get delegation suggestions
- `POST /api/ai/review-delegation`: Review delegation security
- `POST /api/ai/team-report`: Generate team report

## Future Enhancements

- **Blockchain Integration**: Full on-chain persistence of delegations
- **Advanced Analytics**: Deeper financial pattern recognition
- **Multi-chain Support**: Extend delegation across multiple blockchains
- **Custom AI Training**: Domain-specific AI training for Web3 financial concepts
- **Mobile Application**: Native mobile experience for on-the-go delegation management
- **Subscription Recommendations**: AI-powered subscription optimization suggestions
- **Smart Subscription Triggers**: Conditional subscriptions based on on-chain events
- **Subscription Templates**: Pre-defined subscription configurations for common use cases

## License

MIT

## Acknowledgments

- MetaMask for ERC-7715 Delegation Toolkit
- OpenAI for GPT-4o model
- shadcn/ui for component system