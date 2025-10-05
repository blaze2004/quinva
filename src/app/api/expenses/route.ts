import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  CreateExpenseSchema,
  ExpenseListResponseSchema,
  ExpenseQuerySchema,
} from "@/lib/zod/expense";

/**
 * Get user expenses with filtering and pagination
 * @description Retrieve a paginated list of expenses for the authenticated user with optional filtering
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

    const { success, data: validatedQuery } =
      ExpenseQuerySchema.safeParse(queryParams);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid query parameters", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }
    const {
      limit,
      cursor,
      category,
      isRecurring,
      budgetId,
      startDate,
      endDate,
    } = validatedQuery;

    const where: any = {
      userId: session.user.id,
    };

    if (category) {
      where.category = {
        contains: category,
        mode: "insensitive",
      };
    }

    if (typeof isRecurring === "boolean") {
      where.isRecurring = isRecurring;
    }

    if (budgetId) {
      where.budgetId = budgetId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const total = await prisma.expense.count({ where });

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit + 1, // Take one extra to check if there are more
      ...(cursor && { cursor: { id: cursor }, skip: 1 }), // Skip the cursor item
    });

    const hasNext = expenses.length > limit;
    const expensesToReturn = hasNext ? expenses.slice(0, -1) : expenses;
    const nextCursor = hasNext
      ? expensesToReturn[expensesToReturn.length - 1]?.id
      : null;

    const response = {
      expenses: expensesToReturn,
      pagination: {
        limit,
        total,
        hasNext,
        nextCursor,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching expenses:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * Create a new expense
 * @description Create a new expense for the authenticated user
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
    const { success, data: validatedData } =
      CreateExpenseSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid request data", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
