"use client";

import { useState } from "react";
import { Budget } from "@/lib/zod/budget";
import BudgetForm from "@/components/budgets/budget-form";
import BudgetList from "@/components/budgets/budget-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Target } from "lucide-react";

export default function BudgetsPage() {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleNewBudget = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Set and track your expense budgets
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBudget}>
              <Target className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader className="hidden">
              <DialogTitle>
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              onSuccess={handleFormSuccess}
              initialData={
                editingBudget
                  ? {
                      name: editingBudget.name,
                      description: editingBudget.description || undefined,
                      targetAmount: editingBudget.targetAmount,
                      deadline: editingBudget.deadline || undefined,
                    }
                  : undefined
              }
              isEditing={!!editingBudget}
              budgetId={editingBudget?.id}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BudgetList
        onEditBudget={handleEditBudget}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
