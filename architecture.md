# Application Architecture

## Project Overview

Quinva is a personal finance management web application designed to help users track expenses, manage budgets, and achieve financial goals. The application is inspired by Splitwise but focuses on individual expense tracking and budget management rather than group expense splitting.

**Key Features:**
- User authentication and profile management
- Expense tracking with categorization and recurring expenses
- Budget creation and monitoring
- Financial dashboard with statistics and insights
- Email notifications for important events
- RESTful API with OpenAPI documentation

## Technology Stack & Technical Decisions

### Core Framework: Next.js 15
**Decision Rationale:** Next.js was chosen for its full-stack capabilities, allowing both frontend and backend (API routes) to be developed within a single application. The App Router provides excellent developer experience with file-based routing, server components, and built-in optimizations.

**Key Benefits:**
- Unified development experience
- Built-in API routes for backend functionality
- Server-side rendering and static generation
- Excellent TypeScript support
- Turbopack for faster development builds

### Programming Language: TypeScript
**Decision Rationale:** TypeScript provides type safety, better developer experience, and makes debugging significantly easier.

### Styling: Tailwind CSS + Shadcn/UI
**Decision Rationale:** 
- **Tailwind CSS:** Utility-first CSS framework for rapid development and consistent design
- **Shadcn/UI:** Component library built on Radix UI primitives, providing accessible, customizable components without vendor lock-in

### Authentication: Better Auth
**Decision Rationale:** Better Auth was chosen over building custom authentication due to its comprehensive feature set and security best practices:
- Email verification out of the box
- Session management
- Password reset functionality
- Username/email login support
- Extensible for future OAuth providers
- Type-safe and framework-agnostic

### Database: PostgreSQL + Prisma ORM
**Decision Rationale:**
- **PostgreSQL:** Robust, ACID-compliant database suitable for financial data (Supabase free tier)
- **Prisma:** Type-safe ORM with excellent developer experience, auto-generated types, and migration management

### Code Quality: Biome
**Decision Rationale:** Biome was chosen over ESLint due to:
- Faster performance
- Single tool for linting and formatting
- Better developer experience
- Avoiding the complexity of ESLint v8 to v9 migration

### Email Service: Resend + React Email
**Decision Rationale:** 
- Modern email service with good developer experience
- React-based email templates for maintainability
- Reliable delivery for transactional emails

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client (Web)  │    │   Next.js App   │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│ • React Pages   │◄──►│ • API Routes    │◄──►│ • User Data     │
│ • Components    │    │ • Middleware    │    │ • Expenses      │
│ • Auth Client   │    │ • Auth System   │    │ • Budgets       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Email Service │
                       │   (Resend)      │
                       └─────────────────┘
```

### Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Protected app routes
│   ├── (auth)/                  # Authentication routes
│   ├── api/                     # API endpoints
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── budgets/                 # Budget-specific components
│   ├── expenses/                # Expense-specific components
│   ├── sidebar/                 # Navigation components
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility libraries
│   ├── auth/                    # Authentication configuration
│   ├── zod/                     # Schema validation
│   ├── prisma.ts               # Database client
│   └── utils.ts                # Utility functions
├── config/                      # Environment configuration
├── email/                       # Email templates
└── generated/                   # Generated Prisma client
```

## Database Schema

### Core Entities

#### User
```sql
- id: String (Primary Key)
- name: String
- email: String (Unique)
- emailVerified: Boolean
- username: String (Unique, Optional)
- displayUsername: String (Optional)
- image: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Expense
```sql
- id: String (Primary Key, UUID)
- description: String
- amount: Decimal(10,2)  -- INR with 2 decimal places
- category: String
- isRecurring: Boolean
- recurrenceType: Enum (NONE, DAILY, WEEKLY, MONTHLY, YEARLY)
- date: DateTime
- userId: String (Foreign Key)
- budgetId: String (Foreign Key, Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Budget
```sql
- id: String (Primary Key, CUID)
- name: String
- description: String (Optional)
- targetAmount: Decimal(10,2)
- currentAmount: Decimal(10,2)  -- Calculated from associated expenses
- deadline: DateTime (Optional)
- isCompleted: Boolean
- userId: String (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Authentication Tables
- **Session:** Manages user sessions with expiration and device tracking
- **Account:** Stores authentication provider information
- **Verification:** Handles email verification tokens

## API Design

### RESTful API Structure

The application follows REST principles with consistent response formats:

```
/api/
├── auth/[...all]           # Authentication endpoints (Better Auth)
├── budgets/                # Budget management
│   ├── GET /               # List budgets (paginated, filtered)
│   ├── POST /              # Create budget
│   └── [id]/
│       ├── GET /           # Get budget by ID
│       ├── PUT /           # Update budget
│       └── DELETE /        # Delete budget
├── expenses/               # Expense management
│   ├── GET /               # List expenses (cursor-based pagination)
│   ├── POST /              # Create expense
│   └── [id]/
│       ├── GET /           # Get expense by ID
│       ├── PUT /           # Update expense
│       └── DELETE /        # Delete expense
├── stats/                  # Dashboard statistics
└── docs/                   # OpenAPI documentation (Redocs Ui)
```

### API Features

1. **Authentication:** All protected endpoints require valid session tokens
2. **Validation:** Zod schemas for request/response validation and environment variable type safety
3. **Pagination:** 
   - Offset-based for budgets
   - Cursor-based for expenses (better performance)
4. **Filtering:** Query parameters for data filtering
5. **Error Handling:** Consistent error response format
6. **OpenAPI Documentation:** Auto-generated API docs with next-openapi-gen


## Authentication & Authorization

### Authentication Flow

```
1. User Registration
   ├── Email/Username + Password
   ├── Email Verification Optional
   └── Auto-login after verification

2. User Login
   ├── Username + Password
   ├── Session Token Generation
   └── Redirect to Dashboard

3. Session Management
   ├── HTTP-only Cookies
   └── Session Expiration Handling

4. Password Reset
   ├── Email-based Reset
   ├── Secure Token Generation
   └── Email Template Delivery
```

### Middleware Protection

```typescript
// Route Protection Strategy
- Public: /, /login, /signup, /forgot-password, /reset-password
- Protected: /dashboard, /expenses, /budgets, /profile
- API: All /api routes except /api/auth require authentication
```

### Security Features

- Password complexity validation
- Email verification requirement
- Session hijacking protection
- CSRF protection via Better Auth


## State Management

- **Form State:** React Hook Form with Zod validation
- **UI State:** React built-in state (useState, useContext)
- **Theme State:** next-themes for dark/light mode

## Data Validation & Type Safety

### Zod Schema Validation

```typescript
// Validation Strategy
1. API Request Validation
   - Input sanitization
   - Type checking
   - Business rule validation

2. Database Operations
   - Schema validation before operations
   - Type-safe Prisma queries

3. Client-Side Validation
   - Form validation with react-hook-form
   - Real-time feedback
```

## Error Handling & Logging

### Error Handling Strategy

1. **Client-Side Errors**
   - Form validation errors
   - Network request failures
   - User-friendly error messages

2. **Server-Side Errors**
   - Database operation failures
   - Authentication errors
   - Structured error responses

3. **Error Boundaries**
   - React error boundaries for component errors
   - Graceful fallback UI