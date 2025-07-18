# Backend API

A Node.js/Express backend built with TypeScript, following the Controller-Service-Repository pattern with PostgreSQL database.

## 🏗️ Architecture

This backend follows a clean architecture pattern with clear separation of concerns:

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── repositories/    # Data access layer
├── routes/          # Route definitions
├── db/             # Database configuration & migrations
├── config/         # Configuration files
├── errors/         # Custom error classes
├── middleware/     # Express middleware
└── types/          # TypeScript type definitions
```

### Pattern Overview

- **Controllers**: Handle HTTP requests/responses, input validation, and error handling
- **Services**: Contain business logic, orchestrate operations between repositories
- **Repositories**: Handle data persistence, database operations
- **Error Handling**: Custom error classes with global error middleware
- **Shared Types**: Common types shared between frontend and backend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose
- PostgreSQL (via Docker)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL Database

```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Or if you have a separate docker-compose.yml
docker-compose up -d
```

### 3. Set Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/your_db_name
PORT=4000
NODE_ENV=development
```

### 4. Run Database Migrations

```bash
pnpm kysely migrate up
```

### 5. Start Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:4000/api`

## 📁 Project Structure

### Controllers (`src/controllers/`)

Controllers handle HTTP requests and responses. They use the `asyncHandler` wrapper for automatic error handling:

- Request/response handling
- Input validation
- Automatic error propagation
- Calling appropriate services

```typescript
export class ExampleController {
  getOne = asyncHandler(async (req: Request, res: Response) => {
    const example = await service.getExample(req.params.id)
    res.json(example)
  })
}
```

### Services (`src/services/`)

Services contain business logic and orchestrate operations between repositories:

```typescript
export class ExampleService {
  private repository = new ExampleRepository();

  async getExample(id: string): Promise<Example> {
    const example = await this.repository.findById(id);
    if (!example) throw new NotFoundError('Example not found');
    return example;
  }
}
```

### Repositories (`src/repositories/`)

Repositories handle data persistence and database operations:

```typescript
export class ExampleRepository {
  async findById(id: string): Promise<Example | null> {
    const row = await db
      .selectFrom('examples')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? this.mapToExample(row) : null;
  }

  async findAll(): Promise<Example[]> {
    const rows = await db
      .selectFrom('examples')
      .selectAll()
      .execute();

    return rows.map(this.mapToExample);
  }
}
```

## 🛡️ Error Handling

### Custom Error Classes (`src/errors/`)

The application uses custom error classes for consistent error handling:

```typescript
// 4xx Client Errors
throw new NotFoundError('Example not found')
throw new BadRequestError('Invalid input')
throw new ValidationError('Validation failed')

// 5xx Server Errors
throw new InternalServerError('Database operation failed')
```

### Global Error Handler (`src/middleware/errorHandler.ts`)

All errors are handled by a centralized error handler that:

- **Formats error responses** consistently
- **Handles Zod validation errors** automatically
- **Includes stack traces** in development only
- **Logs non-operational errors** for debugging

### Error Response Format

```json
{
  "error": "NotFoundError",
  "message": "Example not found",
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/examples/123",
  "method": "GET"
}
```

### Async Error Wrapper

Controllers use `asyncHandler` to eliminate repetitive try-catch blocks:

```typescript
getOne = asyncHandler(async (req: Request, res: Response) => {
  const example = await service.getExample(req.params.id)
  res.json(example)
})
```

## 🗄️ Database

The project uses PostgreSQL running in Docker for local development. The database configuration is in `docker-compose.yml`:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Stop PostgreSQL
docker-compose down
```

The database will be available at:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `template_monorepo`
- **Username**: `postgres`
- **Password**: `password`

### Database Migrations

Migrations are managed with Kysely:

```bash
# Create a new migration
pnpm kysely migration create create_examples_table

# Run migrations
pnpm kysely migrate up

# Rollback migrations
pnpm kysely migrate down
```

### Database Schema

The database uses Kysely for type-safe database operations:

```typescript
export interface Database {
  examples: Example;
}
```

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run database migrations
pnpm kysely migrate up

# Generate database types
pnpm kysely generate
```

### TypeScript Configuration

The project uses TypeScript with strict configuration and path mapping:

- `~/*` maps to `src/*`
- Shared types from `~/shared`
- Strict type checking enabled

### Adding Pagination to Endpoints

To add pagination to any endpoint:

1. **Add pagination middleware to the route:**
```typescript
import { paginationMiddleware } from '~/middleware/pagination'

// Apply pagination middleware
exampleRouter.get('/paginated', paginationMiddleware(10, 100), ctrl.getPaginated.bind(ctrl))
```

2. **Update the controller method:**
```typescript
getPaginated = asyncHandler(async (req: Request, res: Response) => {
  if (!req.pagination) {
    throw new Error('Pagination middleware not applied')
  }
  
  const result = await service.getPaginated(req.pagination)
  res.json(result)
})
```

3. **Update the repository method:**
```typescript
async findAllPaginated(options: PaginationOptions): Promise<PaginatedResponse<Example>> {
  // Get total count
  const totalResult = await db
    .selectFrom('examples')
    .select(db.fn.count('id').as('total'))
    .executeTakeFirst()

  const total = Number(totalResult?.total || 0)

  // Get paginated data
  const rows = await db
    .selectFrom('examples')
    .selectAll()
    .orderBy(options.sortBy, options.sortOrder)
    .limit(options.limit)
    .offset(options.offset)
    .execute()

  return createPaginatedResponse(rows.map(this.mapToExample), total, options)
}
```

### Request Validation

The API includes comprehensive request validation using Zod schemas:

#### Built-in Validation Middleware

```typescript
import { 
  validateIdParam, 
  validateCreateExample, 
  validateUpdateExample 
} from '~/middleware/validation'

// Apply validation to routes
exampleRouter.get('/:id', validateIdParam(), ctrl.getOne.bind(ctrl))
exampleRouter.post('/', validateCreateExample(), ctrl.create.bind(ctrl))
exampleRouter.put('/:id', validateUpdateExample(), ctrl.update.bind(ctrl))
```

#### Custom Validation Schemas

```typescript
import { z } from 'zod'
import { createValidationMiddleware } from '~/middleware/validation'

// Create custom validation schema
const customSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older')
})

// Create validation middleware
const validateCustom = createValidationMiddleware({
  body: customSchema
})

// Apply to route
exampleRouter.post('/custom', validateCustom, ctrl.createCustom.bind(ctrl))
```

#### Validation Error Response

```json
{
  "error": "ValidationError",
  "message": "name: Name is required, email: Invalid email format",
  "statusCode": 422,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/examples",
  "method": "POST"
}
```

### Environment Variables

| Variable       | Description                  | Default       |
| -------------- | ---------------------------- | ------------- |
| `DATABASE_URL` | PostgreSQL connection string | Required      |
| `PORT`         | Server port                  | `4000`        |
| `NODE_ENV`     | Environment                  | `development` |

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📦 Dependencies

### Production Dependencies

- **express**: Web framework
- **kysely**: Type-safe SQL query builder
- **pg**: PostgreSQL client
- **zod**: Runtime type validation

### Development Dependencies

- **typescript**: TypeScript compiler
- **tsx**: TypeScript execution engine
- **kysely-ctl**: Database migration tool
- **@types/express**: Express type definitions

## 🌐 REST API Compliance

### Complete CRUD Operations

The API follows REST principles with full CRUD support:

```typescript
// GET    /api/examples          - Get all examples
// GET    /api/examples/paginated - Get paginated examples
// GET    /api/examples/:id      - Get single example
// POST   /api/examples          - Create new example
// PUT    /api/examples/:id      - Update example (full update)
// PATCH  /api/examples/:id      - Update example (partial update)
// DELETE /api/examples/:id      - Delete example
```

## 🏥 Health Check System

The API includes a comprehensive health check system for monitoring and deployment. The system is template-friendly and adapts based on your configuration:

- **With Database**: Full health checks including database connectivity
- **Without Database**: Basic health checks (memory, disk) - perfect for template repos

### Health Check Endpoints

```typescript
// Basic health check
GET /health                    - Simple 200 OK response

// Detailed health check
GET /health/detailed           - Full system health with database, memory, disk

// Specific checks
GET /health/database           - Database connectivity only
GET /health/memory             - Memory usage only

// Kubernetes probes
GET /health/ready              - Readiness probe
GET /health/live               - Liveness probe
```

### Health Check Response

**With Database Configured:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600000,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "details": {
        "connection": "established",
        "queryTime": "15ms"
      }
    },
    "memory": {
      "status": "healthy",
      "details": {
        "heapUsed": "45.2 MB",
        "heapTotal": "67.8 MB",
        "usagePercent": "66.67%"
      }
    },
    "disk": {
      "status": "healthy",
      "details": {
        "check": "basic",
        "message": "Disk space check passed"
      }
    }
  }
}
```

**Without Database (Template Mode):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600000,
  "version": "1.0.0",
  "checks": {
    "memory": {
      "status": "healthy",
      "details": {
        "heapUsed": "45.2 MB",
        "heapTotal": "67.8 MB",
        "usagePercent": "66.67%"
      }
    },
    "disk": {
      "status": "healthy",
      "details": {
        "check": "basic",
        "message": "Disk space check passed"
      }
    }
  }
}
```

### Kubernetes Integration

For Kubernetes deployments, use these endpoints:

```yaml
# livenessProbe
livenessProbe:
  httpGet:
    path: /health/live
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 10

# readinessProbe
readinessProbe:
  httpGet:
    path: /health/ready
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Pagination System

The API includes a flexible pagination system:

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Field to sort by (default: 'createdAt')
- `sortOrder`: Sort direction 'asc' or 'desc' (default: 'desc')

#### Example Usage

```bash
# Get first page with 10 items
GET /api/examples/paginated

# Get second page with 20 items, sorted by name
GET /api/examples/paginated?page=2&limit=20&sortBy=name&sortOrder=asc
```

#### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### HTTP Status Codes

The API uses appropriate HTTP status codes:

- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error

## 📚 API Documentation

### Example Endpoints

#### GET /api/examples/:id

Get a single example by ID

```bash
curl http://localhost:4000/api/examples/123
```

#### POST /api/examples

Create a new example

```bash
curl -X POST http://localhost:4000/api/examples \
  -H "Content-Type: application/json" \
  -d '{"name": "Example"}'
```

#### PUT /api/examples/:id

Update an example (full update)

```bash
curl -X PUT http://localhost:4000/api/examples/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Example"}'
```

#### DELETE /api/examples/:id

Delete an example

```bash
curl -X DELETE http://localhost:4000/api/examples/123
```
