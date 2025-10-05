import { Decimal } from "@prisma/client/runtime/library";
import { type NextRequest, NextResponse } from "next/server";
import type { Budget } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BudgetQuerySchema, CreateBudgetSchema } from "@/lib/zod/budget";

export function calculateBudgetMetrics(budget: Partial<Budget>) {
  const targetAmount = Number(budget.targetAmount);
  const currentAmount = Number(budget.currentAmount);

  const spentPercentage =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const remainingAmount = Math.max(targetAmount - currentAmount, 0);

  let daysRemaining = null;
  let isOverdue = false;

  if (budget.deadline) {
    const now = new Date();
    const deadline = new Date(budget.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isOverdue = daysRemaining < 0;
  }

  return {
    ...budget,
    targetAmount,
    currentAmount,
    spentPercentage: Math.round(spentPercentage * 100) / 100,
    remainingAmount,
    daysRemaining,
    isOverdue,
  };
}

/**
 * Get user budgets with filtering and pagination
 * @description Retrieve a paginated list of budgets for the authenticated user with optional filtering
 * @openapi
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const queryParams = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const { data: validatedQuery, success } =
      BudgetQuerySchema.safeParse(queryParams);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid query parameters", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }
    const { page, limit, isCompleted, hasDeadline } = validatedQuery;

    const where: any = {
      userId: session.user.id,
    };

    if (typeof isCompleted === "boolean") {
      where.isCompleted = isCompleted;
    }

    if (typeof hasDeadline === "boolean") {
      if (hasDeadline) {
        where.deadline = { not: null };
      } else {
        where.deadline = null;
      }
    }

    const total = await prisma.budget.count({ where });

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const budgetsWithMetrics = budgets.map((budget) => {
      const expenseSum = budget.expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);

      const budgetWithCurrentAmount = {
        ...budget,
        currentAmount: Decimal(expenseSum),
      };

      return calculateBudgetMetrics(budgetWithCurrentAmount);
    });

    const response = {
      budgets: budgetsWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching budgets:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

/**
 * Create a new budget
 * @description Create a new budget for the authenticated user
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = CreateBudgetSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const budget = await prisma.budget.create({
      data: {
        ...validatedData.data,
        targetAmount: new Decimal(validatedData.data.targetAmount),
        deadline: validatedData.data.deadline
          ? new Date(validatedData.data.deadline)
          : null,
        userId: session.user.id,
      },
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    const budgetWithMetrics = calculateBudgetMetrics(budget);

    return NextResponse.json(budgetWithMetrics, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
