import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UpdateExpenseSchema } from "@/lib/zod/expense";

/**
 * Get expense by ID
 * @description Retrieve a specific expense by its ID
 * @openapi
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const { id } = await params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

/**
 * Update an existing expense
 * @description Update an existing expense by its ID for the authenticated user
 * @openapi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const { id } = await params;

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = UpdateExpenseSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: validatedData.data,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

/**
 * Delete an existing expense
 * @description Delete an existing expense by its ID for the authenticated user
 * @openapi
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get session from headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
