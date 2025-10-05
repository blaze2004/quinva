import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Get dashboard statistics
 * @description Retrieve overview statistics for expenses and goals
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

    const userId = session.user.id;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalExpenses,
      totalExpenseAmount,
      thisMonthExpenses,
      lastMonthExpenses,
      expensesByCategory,
    ] = await Promise.all([
      prisma.expense.count({ where: { userId } }),

      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),

      prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: startOfThisMonth },
        },
        _sum: { amount: true },
      }),

      prisma.expense.aggregate({
        where: {
          userId,
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: { amount: true },
      }),

      prisma.expense.groupBy({
        by: ["category"],
        where: { userId },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      }),
    ]);

    const [goals, totalGoals, completedGoals] = await Promise.all([
      prisma.goal.findMany({
        where: { userId },
        include: {
          expenses: {
            select: { amount: true },
          },
        },
      }),

      prisma.goal.count({ where: { userId } }),

      prisma.goal.count({
        where: {
          userId,
          isCompleted: true,
        },
      }),
    ]);

    let totalTargetAmount = 0;
    let totalCurrentAmount = 0;
    let totalProgress = 0;

    goals.forEach((goal) => {
      const targetAmount = Number(goal.targetAmount);
      const currentAmount = goal.expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);

      totalTargetAmount += targetAmount;
      totalCurrentAmount += currentAmount;

      if (targetAmount > 0) {
        const progress = Math.min((currentAmount / targetAmount) * 100, 100);
        totalProgress += progress;
      }
    });

    const averageProgress = totalGoals > 0 ? totalProgress / totalGoals : 0;

    const response = {
      expenses: {
        total: totalExpenses,
        totalAmount: Number(totalExpenseAmount._sum.amount || 0),
        thisMonth: Number(thisMonthExpenses._sum.amount || 0),
        lastMonth: Number(lastMonthExpenses._sum.amount || 0),
        byCategory: expensesByCategory.map((item) => ({
          category: item.category,
          amount: Number(item._sum.amount || 0),
          count: item._count.id,
        })),
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        totalTargetAmount,
        totalCurrentAmount,
        averageProgress: Math.round(averageProgress * 100) / 100,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
