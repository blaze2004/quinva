import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreateGoalSchema, GoalQuerySchema } from "@/lib/zod/goal";
import { Decimal } from "@prisma/client/runtime/library";
import { Goal } from "@/generated/prisma";

export function calculateGoalMetrics(goal: Partial<Goal>) {
  const targetAmount = Number(goal.targetAmount);
  const currentAmount = Number(goal.currentAmount);

  const progressPercentage =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const remainingAmount = Math.max(targetAmount - currentAmount, 0);

  let daysRemaining = null;
  let isOverdue = false;

  if (goal.deadline) {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isOverdue = daysRemaining < 0;
  }

  return {
    ...goal,
    targetAmount,
    currentAmount,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    remainingAmount,
    daysRemaining,
    isOverdue,
  };
}

/**
 * Get user goals with filtering and pagination
 * @description Retrieve a paginated list of goals for the authenticated user with optional filtering
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
        { status: 401 }
      );
    }

    const queryParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    const { data: validatedQuery, success } =
      GoalQuerySchema.safeParse(queryParams);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid query parameters", code: "BAD_REQUEST" },
        { status: 400 }
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

    const total = await prisma.goal.count({ where });

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const goals = await prisma.goal.findMany({
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

    const goalsWithMetrics = goals.map((goal) => {
      const expenseSum = goal.expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);

      const goalWithCurrentAmount = {
        ...goal,
        currentAmount: Decimal(expenseSum),
      };

      return calculateGoalMetrics(goalWithCurrentAmount);
    });

    const response = {
      goals: goalsWithMetrics,
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
    console.error("Error fetching goals:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid query parameters", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * Create a new goal
 * @description Create a new goal for the authenticated user
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
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateGoalSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
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

    const goalWithMetrics = calculateGoalMetrics(goal);

    return NextResponse.json(goalWithMetrics, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
