import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateGoalSchema } from "@/lib/zod/goal";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateGoalMetrics } from "../route";

/**
 * Get goal by ID
 * @description Retrieve a specific goal by its ID with associated expenses
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

    const goal = await prisma.goal.findFirst({
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

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const expenseSum = goal.expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    const goalWithCurrentAmount = {
      ...goal,
      currentAmount: Decimal(expenseSum),
      expenses: goal.expenses.map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
      })),
    };

    const goalWithMetrics = calculateGoalMetrics(goalWithCurrentAmount);

    return NextResponse.json(goalWithMetrics);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * Update goal by id
 * @description Update a specific goal by its ID
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

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data: validatedData, success } = UpdateGoalSchema.safeParse(body);

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

    const updatedGoal = await prisma.goal.update({
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

    const expenseSum = updatedGoal.expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    const goalWithCurrentAmount = {
      ...updatedGoal,
      currentAmount: Decimal(expenseSum),
    };

    const goalWithMetrics = calculateGoalMetrics(goalWithCurrentAmount);

    return NextResponse.json(goalWithMetrics);
  } catch (error) {
    console.error("Error updating goal:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * Delete a specific goal by its ID
 * @description Delete a specific goal by its ID
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

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
