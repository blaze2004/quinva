import { z } from "zod";
import { RecurrenceType } from "@/generated/prisma";

const RecurrenceTypeSchema = z.enum(RecurrenceType);

export const CreateExpenseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  amount: z
    .number()
    .max(1000000, "Amount is too large")
    .positive("Amount must be positive"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category is too long"),
  isRecurring: z.boolean(),
  recurrenceType: RecurrenceTypeSchema,
  date: z.iso.datetime(),
  goalId: z.string().optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();

export const ExpenseQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
  category: z.string().optional(),
  isRecurring: z.coerce.boolean().optional(),
  goalId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const ExpenseSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  isRecurring: z.boolean(),
  recurrenceType: RecurrenceTypeSchema,
  date: z.date(),
  goalId: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ExpenseListResponseSchema = z.object({
  expenses: z.array(ExpenseSchema),
  pagination: z.object({
    limit: z.number(),
    total: z.number(),
    hasNext: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

export const SUGGESTED_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Education",
  "Travel",
  "Insurance",
  "Other",
] as const;

export type Expense = z.infer<typeof ExpenseSchema>;
export type ExpenseListResponse = z.infer<typeof ExpenseListResponseSchema>;
export { RecurrenceType };
