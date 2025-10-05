"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGoalSchema } from "@/lib/zod/goal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

type CreateGoalFormData = z.infer<typeof CreateGoalSchema>;

interface GoalFormProps {
  onSuccess?: () => void;
  initialData?: {
    name: string;
    description?: string;
    targetAmount: number;
    deadline?: Date | string;
  };
  isEditing?: boolean;
  goalId?: string;
}

export default function GoalForm({
  onSuccess,
  initialData,
  isEditing = false,
  goalId,
}: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateGoalFormData>({
    resolver: zodResolver(CreateGoalSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      targetAmount: initialData?.targetAmount || 0,
      deadline: initialData?.deadline
        ? new Date(initialData.deadline).toISOString()
        : undefined,
    },
  });

  const onSubmit = async (data: CreateGoalFormData) => {
    try {
      setIsLoading(true);

      const url = isEditing ? `/api/goals/${goalId}` : "/api/goals";
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
          errorData.error || `Failed to ${isEditing ? "update" : "create"} goal`
        );
      }

      toast.success(`Goal ${isEditing ? "updated" : "created"} successfully!`);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} goal`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl border-none">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Goal" : "Create New Goal"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter goal name (e.g., Emergency Fund, Vacation)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about your goal..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount (INR)</FormLabel>
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
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? "Saving..."
                  : isEditing
                    ? "Update Goal"
                    : "Create Goal"}
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
