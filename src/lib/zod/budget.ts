import { z } from "zod";

export const CreateBudgetSchema = z.object({
  name: z
    .string()
    .min(1, "Budget name is required")
    .max(100, "Budget name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  targetAmount: z.number().positive("Target amount must be positive").max(100000000, "Target amount is too large"),
  deadline: z.iso.datetime().optional(),
});

export const UpdateBudgetSchema = CreateBudgetSchema.partial();

export const BudgetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  isCompleted: z.coerce.boolean().optional(),
  hasDeadline: z.coerce.boolean().optional(),
});

export const BudgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  deadline: z.date().nullable(),
  isCompleted: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Calculated fields
  spentPercentage: z.number().min(0).max(100),
  remainingAmount: z.number(),
  daysRemaining: z.number().nullable(),
  isOverdue: z.boolean(),
});

export const BudgetListResponseSchema = z.object({
  budgets: z.array(BudgetSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const BudgetWithExpensesSchema = BudgetSchema.extend({
  expenses: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      amount: z.number(),
      category: z.string(),
      date: z.date(),
    })
  ),
});


export type Budget = z.infer<typeof BudgetSchema>;
export type BudgetListResponse = z.infer<typeof BudgetListResponseSchema>;
export type BudgetWithExpenses = z.infer<typeof BudgetWithExpensesSchema>;
