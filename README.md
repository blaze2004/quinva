# Quinva

Quinva is a personal finance management application designed to help you track your expenses, manage budgets, and achieve your financial goals.

## Features

*   **Expense Tracking:** Easily record and categorize your daily expenses.
*   **Budget Management:** Create and manage budgets to keep your spending in check.
*   **Financial Goals:** Set and track your financial goals.
*   **Dashboard:** A comprehensive overview of your financial health.
*   **User Authentication:** Secure user authentication and profile management.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
*   **Authentication:** [BetterAuth.js](https://www.better-auth.com/)
*   **UI:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
*   **Linting/Formatting:** [Biome](https://biomejs.dev/)

## Documentation

*   [Architecture](architecture.md)
*   [OpenAPI.json](public/openapi.json)
*   [API Documentation](https://quinva.visualbrahma.tech/api/docs)

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/blaze2004/quinva)

Make sure you have the following installed on your local machine:

*   [Node.js](https://nodejs.org/en/) (v18 or later)
*   [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/blaze2004/quinva.git
    cd quinva
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

### Environment Configuration

1.  **Create a `.env` file** by copying the example file:

    ```bash
    cp .env.example .env.local
    ```

2.  Sign up on **Supabase** and create a project and get postgresql connection strings

3.  **Run database migrations:**

    ```bash
    pnpm prisma migrate dev
    ```

### Running the Application

1.  **Start the development server:**

    ```bash
    pnpm dev
    ```

2.  **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000).

### Email Preview

1. **Start the development server:**

    ```bash
    pnpm email:dev
    ```
2.  **Open your browser** and navigate to [http://localhost:3001](http://localhost:3001).


## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.