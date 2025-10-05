import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateBudgetSchema } from "@/lib/zod/budget";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateBudgetMetrics } from "../route";

/**
 * Get budget by ID
 * @description Retrieve a specific budget by its ID with associated expenses
 * @openapi
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = await params;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
            category: true,
            date: true,
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const expenseSum = budget.expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    const budgetWithCurrentAmount = {
      ...budget,
      currentAmount: Decimal(expenseSum),
      expenses: budget.expenses.map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
      })),
    };

    const budgetWithMetrics = calculateBudgetMetrics(budgetWithCurrentAmount);

    return NextResponse.json(budgetWithMetrics);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * Update budget by id
 * @description Update a specific budget by its ID
 * @openapi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = await params;

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data: validatedData, success } = UpdateBudgetSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid request data", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.targetAmount !== undefined)
      updateData.targetAmount = new Decimal(validatedData.targetAmount);
    if (validatedData.deadline !== undefined) {
      updateData.deadline = validatedData.deadline
        ? new Date(validatedData.deadline)
        : null;
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    const expenseSum = updatedBudget.expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    const budgetWithCurrentAmount = {
      ...updatedBudget,
      currentAmount: Decimal(expenseSum),
    };

    const budgetWithMetrics = calculateBudgetMetrics(budgetWithCurrentAmount);

    return NextResponse.json(budgetWithMetrics);
  } catch (error) {
    console.error("Error updating budget:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * Delete a specific budget by its ID
 * @description Delete a specific budget by its ID
 * @openapi
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = await params;

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
