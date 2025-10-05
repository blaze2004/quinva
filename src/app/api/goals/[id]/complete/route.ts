import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Mark goal as completed
 * @description Mark a goal as completed or uncompleted
 * @openapi
 */

export async function POST(
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
    const body = await request.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "isCompleted must be a boolean", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

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

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: { isCompleted },
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

    const targetAmount = Number(updatedGoal.targetAmount);
    const currentAmount = expenseSum;
    const progressPercentage =
      targetAmount > 0
        ? Math.min((currentAmount / targetAmount) * 100, 100)
        : 0;
    const remainingAmount = Math.max(targetAmount - currentAmount, 0);

    let daysRemaining = null;
    let isOverdue = false;

    if (updatedGoal.deadline) {
      const now = new Date();
      const deadline = new Date(updatedGoal.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = daysRemaining < 0;
    }

    const response = {
      ...updatedGoal,
      targetAmount,
      currentAmount,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      remainingAmount,
      daysRemaining,
      isOverdue,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating goal completion:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
