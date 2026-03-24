# Bookshelf API

[![CI Pipeline](https://github.com/MuriloRip/bookshelf-api/actions/workflows/ci.yml/badge.svg)](https://github.com/MuriloRip/bookshelf-api/actions/workflows/ci.yml)

A book catalog and review API built with **Node.js**, **TypeScript**, and **Express**. Features Prisma ORM, JWT authentication, input validation with Zod, and role-based access control.

## Tech Stack

- **Node.js 20** + **TypeScript**
- **Express** with async error handling
- **Prisma ORM** + **PostgreSQL**
- **Zod** for schema validation
- **JWT** authentication with bcrypt
- **Helmet** + **Rate Limiting** for security
- **Jest** + **Supertest** for testing
- **Docker** + **Docker Compose**
- **GitHub Actions** CI/CD

## Architecture

```
src/
├── config/              # App config and database client
│   ├── index.ts         # Environment-based settings
│   └── database.ts      # Prisma client instance
├── middleware/          # Express middleware
│   ├── auth.middleware.ts     # JWT auth + admin guard
│   ├── validate.middleware.ts # Zod body/query validation
│   └── error.middleware.ts    # Global error handler
├── routes/              # API route handlers
│   ├── auth.routes.ts   # Register, login, profile
│   ├── book.routes.ts   # CRUD with search & pagination
│   └── review.routes.ts # Reviews with rating system
├── validators/          # Zod validation schemas
│   ├── auth.validator.ts
│   ├── book.validator.ts
│   └── review.validator.ts
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)

### Run with Docker Compose

```bash
git clone https://github.com/MuriloRip/bookshelf-api.git
cd bookshelf-api

docker-compose up -d

# API available at http://localhost:3000
```

### Run Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

### Run Tests

```bash
npm test
```

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login and get JWT |
| GET | `/api/auth/me` | ✓ | Get profile |

### Books
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/books` | ✗ | List books (with search, filter, pagination) |
| GET | `/api/books/:id` | ✗ | Get book details with reviews |
| POST | `/api/books` | Admin | Create a book |
| PUT | `/api/books/:id` | Admin | Update a book |
| DELETE | `/api/books/:id` | Admin | Delete a book |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/books/:id/reviews` | ✗ | List reviews for a book |
| POST | `/api/books/:id/reviews` | ✓ | Add a review |
| PUT | `/api/books/:id/reviews` | ✓ | Update your review |
| DELETE | `/api/books/:id/reviews` | ✓ | Delete your review |

### Query Parameters for `/api/books`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `genre` | string | — | Filter by genre |
| `author` | string | — | Filter by author name |
| `search` | string | — | Search in title, author, description |
| `sortBy` | string | createdAt | Sort field |
| `order` | string | desc | Sort order (asc/desc) |

## Usage Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "John", "email": "john@example.com", "password": "secret123" }'
```

### Create Book (Admin)
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "genre": "TECHNOLOGY",
    "pages": 464,
    "publishedAt": "2008-08-01T00:00:00.000Z"
  }'
```

### Search Books
```bash
curl "http://localhost:3000/api/books?search=clean+code&genre=TECHNOLOGY&page=1&limit=10"
```

### Add Review
```bash
curl -X POST http://localhost:3000/api/books/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "rating": 5, "comment": "Must read for developers!" }'
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | 24h | Token expiration |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |

## License

MIT License
