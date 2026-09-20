# SBMPNexus

> **Every Paper. Every Note. Every Semester.**

SBMPNexus is an AI-powered academic knowledge platform for discovering question papers, notes, study material, and intelligent exam preparation.

## Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (for MongoDB, Redis, MinIO)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd sbmpnexus

# 2. Install dependencies
pnpm install

# 3. Start dev infrastructure
docker compose -f docker-compose.dev.yml up -d

# 4. Copy environment config
cp .env.example .env
# Edit .env with your values (JWT secrets, NVIDIA API key, etc.)

# 5. Seed development data
pnpm db:seed

# 6. Start development servers
pnpm dev
```

### Services

| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (Express) | http://localhost:4000 |
| MinIO Console | http://localhost:9001 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

### Project Structure

```
sbmpnexus/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # Express.js backend
│   └── worker/       # Background job processor
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Environment & constants
│   ├── database/     # Mongoose models
│   └── ai/           # AI provider abstraction
├── infra/            # Docker & nginx configs
└── docs/             # Documentation
```

### Environment Variables

See [.env.example](.env.example) for all required and optional variables.

### AI Configuration

Set `NVIDIA_API_KEY` in your `.env` to enable NVIDIA AI features. Without it, the app uses a mock provider that returns clearly-marked demo responses.

Get your API key from [build.nvidia.com](https://build.nvidia.com).

## License

Private — All rights reserved.
