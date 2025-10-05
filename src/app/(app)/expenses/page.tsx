"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import ExpenseForm from "@/components/expenses/expense-form";
import ExpenseList from "@/components/expenses/expense-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Expense } from "@/lib/zod/expense";

export default function ExpensesPage() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleNewExpense = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your personal expenses
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader className="hidden">
              <DialogTitle>
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSuccess={handleFormSuccess}
              initialData={
                editingExpense
                  ? {
                      description: editingExpense.description,
                      amount: editingExpense.amount,
                      category: editingExpense.category,
                      isRecurring: editingExpense.isRecurring,
                      recurrenceType: editingExpense.recurrenceType,
                      date: editingExpense.date,
                      goalId: editingExpense.goalId || undefined,
                    }
                  : undefined
              }
              isEditing={!!editingExpense}
              expenseId={editingExpense?.id}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ExpenseList
        onEditExpense={handleEditExpense}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
