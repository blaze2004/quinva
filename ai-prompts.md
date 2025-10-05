# Gemini CLI Usage

This document showcases the usage of **Gemini CLI** (Google's AI) in developing the Quinva expense management application. Each prompt demonstrates how AI assisted in building various components of the application, from database schema design to email templates and API documentation.

P.S: This document was formalized by gemini cli only.

## Overview

Quinva is a Splitwise-like application built with Next.js, Prisma, and React Email that allows users to:
- Create and manage expenses
- Manage budgets and track financial goals

---

## Prompt Session 1: Database Schema Design

### Context
- **State**: Starting with an empty Prisma schema file
- **Goal**: Design a complete database schema for a expense-sharing application keeping it minimal
- **Reference**: Splitwise functionality for group expense management

### Prompt
```
create prisma schema for the application, it's like splitwise where users can create groups and manage their expenses and settle bills.
```

### AI Output & Changes
The AI generated a comprehensive Prisma schema including:
- **User model**: Authentication and profile management
- **Group model**: Expense sharing groups with members
- **Expense model**: Individual expense records with split logic
- **Settlement model**: Bill settlement tracking between users
- **Relationships**: Proper foreign keys and many-to-many relationships

**Files Created/Modified**:
- `prisma/schema.prisma` - Complete database schema with all necessary models and relationships

**Key Features Implemented**:
- User authentication system
- Group membership management
- Expense splitting logic
- Settlement tracking

---

## Prompt Session 2: Email Template Development

### Context
- **State**: Need for user communication system
- **Goal**: Create email templates for user verification and group invitations using react email
- **Reference**: Raycast email template from react-email templates collection
- **Tech Stack**: React Email library for template creation

### Prompt
```
generate mail templates using react-email for email verification and group invitation i.e when someone invites you to join a group
```

### AI Output & Changes
The AI created professional email templates with:

**Features**:
- Branded header with logo
- Clear call-to-action buttons
- Professional styling with inline CSS
- TypeScript interfaces for type safety
- Preview props for development testing

**Files Created/Modified**:
- `src/email/group-invitation.tsx` - Group invitation email template
- `src/email/verify-email.tsx` - Email verification template

**Technical Implementation**:
- Used `@react-email/components` for structure
- Integrated with app's environment configuration
- Mobile-responsive design
- Accessible HTML markup

---

## Prompt Session 3: Email Theme Consistency

### Context
- **State**: Email templates had inconsistent styling with main application
- **Goal**: Align email templates with application's global CSS theme
- **Challenge**: React Email doesn't share Tailwind CSS scope

### Prompt
```
can you make it consistent with the theme defined in globals.css without redefining colors in the email template, I know react email doesn't share the default tailwind scope but is there any other way
```

### AI Output & Changes
The AI recommended and implemented:
- **Approach**: Create a shared theme constants file
- **Rationale**: Better to repeat specific colors than entire theme definitions
- **Solution**: Maintain consistency while keeping email templates standalone

**Decision Made**: Keep inline styles for emails to ensure maximum compatibility across email clients, but extract common color values to constants.

---

## Prompt Session 4: Email Layout Optimization

### Context
- **State**: Duplicate code across email templates
- **Goal**: Create reusable email layout component
- **Best Practice**: DRY principle for maintainable code

### Prompt
```
create a shared layout for emails and define the theme, header and footer in there (for preview use dummy child), use the layout in verify email and group invitation email templates
```

### AI Output & Changes
The AI created a comprehensive email system:

**Email Layout Component**:
- Common header with branding
- Consistent footer across all emails
- Reusable theme definitions
- TypeScript props for customization

**Files Created/Modified**:
- `src/email/layout.tsx` - Shared email layout component
- Updated `src/email/verify-email.tsx` - Now uses shared layout
- Updated `src/email/group-invitation.tsx` - Now uses shared layout

**Benefits Achieved**:
- Reduced code duplication
- Consistent branding across all emails
- Easier maintenance and updates
- Better type safety with TypeScript

---

## Prompt Session 5: API Documentation Generation

### Context
- **State**: API routes existed but lacked proper OpenAPI documentation
- **Goal**: Generate comprehensive API documentation
- **Tool**: next-openapi-gen for automatic OpenAPI spec generation
- **Target**: All API routes in `src/app/api` directory

### Prompt
```
add proper type annotations as expected by next-openapi-gen (https://github.com/tazo90/next-openapi-gen?tab=readme-ov-file) to all api routes in order to generate openapi.json for the project.
```

### AI Output & Changes
The AI enhanced all API routes with:

**Type Annotations Added**:
- Request/Response interfaces for all endpoints
- HTTP status code definitions
- Parameter validation schemas
- Error response types

**API Routes Enhanced**:
- `src/app/api/auth/*` - Authentication endpoints
- `src/app/api/budgets/*` - Budget management endpoints  
- `src/app/api/expenses/*` - Expense tracking endpoints
- `src/app/api/stats/*` - Analytics endpoints

**Generated Output**:
- `public/openapi.json` - Complete OpenAPI 3.0 specification
- Automatic documentation for all endpoints
- Type-safe API client generation capability

---

## Prompt Session 6: Documentation Infrastructure Fix

### Context
- **State**: OpenAPI documentation viewer had dynamic import issues
- **Problem**: SSR conflicts with Swagger UI React components
- **Goal**: Fix documentation rendering and provide alternative solution

### Prompt
```
fix the issue with dynamic import (cannot use ssr false with dynamic import), the issue is with swagger react ui package
```
(complete error message was also attached)

### AI Output & Changes
The AI identified and resolved the issue:

**Problem Analysis**:
- Swagger React UI package incompatible with Next.js SSR
- Dynamic imports with `ssr: false` causing build failures
- Client-side rendering conflicts

**Solution Implemented**:
- **Alternative**: Switched from Swagger UI to ReDoc
- **Benefits**: Better Next.js compatibility, cleaner UI, better performance
- **Files Modified**: `src/app/api/docs/*` - Updated documentation viewer

**Technical Outcome**:
- Fully functional API documentation viewer
- Better performance and reliability
- Maintained all OpenAPI specification features

---

## Prompt Session 7: Project Documentation & Setup

### Context
- **State**: Complete application built but lacking comprehensive documentation
- **Goal**: Create detailed README with setup instructions
- **Scope**: Architecture overview, local development setup, deployment guide

### Prompt
```
create the detailed readme with local instruction setup, including architectural design reference and example commands and step by step setup process
```

### AI Output & Changes
The AI created comprehensive project documentation:

**README Sections Created**:
- Project overview and features
- Architecture explanation
- System requirements
- Step-by-step local setup instructions
- Environment configuration guide
- Database setup and migration commands

**Files Created/Modified**:
- `README.md` - Complete project documentation
- Added example `.env.example` configuration

---

There was mixed usage of gemini cli and github copilot to complete different tasks.