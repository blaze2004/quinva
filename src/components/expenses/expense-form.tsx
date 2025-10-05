"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateExpenseSchema,
  SUGGESTED_CATEGORIES,
  RecurrenceType,
} from "@/lib/zod/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { IndianRupee } from "lucide-react";

type CreateExpenseFormData = z.infer<typeof CreateExpenseSchema>;

interface ExpenseFormProps {
  onSuccess?: () => void;
  initialData?: {
    description: string;
    amount: number;
    category: string;
    isRecurring: boolean;
    recurrenceType: RecurrenceType;
    date: Date | string;
    goalId?: string;
  };
  isEditing?: boolean;
  expenseId?: string;
}

export default function ExpenseForm({
  onSuccess,
  initialData,
  isEditing = false,
  expenseId,
}: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<CreateExpenseFormData>({
    resolver: zodResolver(CreateExpenseSchema),
    defaultValues: {
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      category: initialData?.category || "",
      isRecurring: initialData?.isRecurring || false,
      recurrenceType: initialData?.recurrenceType || "NONE",
      date: initialData?.date
        ? new Date(initialData.date).toISOString()
        : new Date().toISOString(),
      goalId: initialData?.goalId || undefined,
    },
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/goals?limit=100&isCompleted=false");
        if (response.ok) {
          const data = await response.json();
          setGoals(
            data.goals.map((goal: any) => ({ id: goal.id, name: goal.name }))
          );
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };
    fetchGoals();
  }, []);

  const isRecurring = form.watch("isRecurring");

  const onSubmit = async (data: CreateExpenseFormData) => {
    try {
      setIsLoading(true);

      const url = isEditing ? `/api/expenses/${expenseId}` : "/api/expenses";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditing ? "update" : "create"} expense`
        );
      }

      toast.success(
        `Expense ${isEditing ? "updated" : "created"} successfully!`
      );
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} expense`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          {isEditing ? "Edit Expense" : "Add New Expense"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter expense description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter or select category"
                        {...field}
                      />
                      <div className="text-sm text-muted-foreground">
                        Suggested:{" "}
                        {SUGGESTED_CATEGORIES.map((cat, index) => (
                          <button
                            key={cat}
                            type="button"
                            className="inline-block mx-1 px-2 py-1 my-1 bg-secondary rounded-sm hover:bg-secondary/80 transition-colors"
                            onClick={() => field.onChange(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(new Date(e.target.value).toISOString())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Recurring Expense
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark this as a recurring expense
                    </div>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How often does this repeat?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="goalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Goal (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? undefined : value)
                    }
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal to track this expense against" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No goal</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? "Saving..."
                  : isEditing
                    ? "Update Expense"
                    : "Add Expense"}
              </Button>
              {onSuccess && (
                <Button type="button" variant="outline" onClick={onSuccess}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
