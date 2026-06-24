
# Market Shop Survey Tool

A full-stack backend system for collecting, managing, and analysing market shop energy data across Lagos, Ogun, and Oyo states.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Seed Data](#seed-data)
- [API Documentation](#api-documentation)
- [PDF Compression Pipeline](#pdf-compression-pipeline)

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB (Mongoose)
- **File Storage**: DigitalOcean Spaces (S3-compatible)
- **Image Compression**: Sharp
- **PDF Generation**: PDFKit
- **Validation**: nestjs-zod + Zod v4
- **Auth**: JWT (access token)



## Local Setup

### Prerequisites
- Node.js >= 20
- MongoDB (local or Atlas URI)
- DigitalOcean Spaces bucket

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Azutech/Assessment-Survey.git
cd survey-assessment

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Fill in environment variables

# 5. Seed the database
# npx ts-node src/seeds/run-all.ts

# 5. Start the server
npm run start:dev
```

Server runs on `http://localhost:3000`

### Default Login Credentials

| Role  | Email              | Password     |
|-------|--------------------|--------------|
| Admin | admin@noemdek.com  | Password@123 |
| Agent | agent1@noemdek.com | Password@123 |
| Agent | agent2@noemdek.com | Password@123 |

---

## Environment Variables

```env
# App
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/survey_assessment

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# DigitalOcean Spaces
SPACES_KEY=your_spaces_key
SPACES_SECRET=your_spaces_secret
SPACES_BUCKET=your_bucket_name
SPACES_REGION=lon1
SPACES_ENDPOINT=https://lon1.digitaloceanspaces.com

# LocationIQ
LOCATIONIQ_API_KEY=your_locationiq_key
LOCATIONIQ_BASE_URL=https://us1.locationiq.com/v1
```


Base URL: `http://localhost:3026`

API Documentation: [Postman](https://documenter.getpostman.com/view/your-collection-link)

All endpoints require `Authorization: Bearer <token>` unless marked public.

---

## Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Agent/admin login |
| POST | /auth/logout | Logout |

## Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /agents/signUp | Register new agent |
| GET | /agents | Get all agents |
| GET | /agents/:id | Get agent by ID |

## Markets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /markets | Get all markets (supports ?search=) |
| GET | /markets/:id | Get market by ID |

## Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /uploads | Upload file to DO Spaces — returns URL |

## Surveys
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /surveys | Submit new survey |
| GET | /surveys | List surveys (?page, ?limit, ?search, ?status, ?market, ?lga, ?energySource, ?hasGPS, ?hasPictures, ?dateRange) |
| GET | /surveys/:id | Get single survey with full details |
| PATCH | /surveys/:id/status | Update status (verified \| unverified \| pending) |

## Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/dashboard | Summary cards — total shops, verified, pending, GPS, markets, agents |
| GET | /analytics/summary | Aggregate metrics + energy source breakdown (?dateRange) |
| GET | /analytics/markets | Per-market stats (?dateRange) |
| GET | /analytics/agents | Per-agent stats (?dateRange) |
| GET | /analytics/electricity-distribution | Electricity supply hours distribution |
| GET | /analytics/wtp-distribution | Willingness to pay distribution |

## Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /export/csv | Export surveys as CSV (?status, ?market, ?lga, ?energySource, ?dateRange) |
| GET | /export/pdf | Export compressed PDF report (?quality=low\|medium\|high, ?status, ?market, ?lga, ?energySource, ?dateRange) |


