"use client";

import { useState } from "react";
import { Goal } from "@/lib/zod/goal";
import GoalForm from "@/components/goals/goal-form";
import GoalList from "@/components/goals/goal-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Target } from "lucide-react";

export default function GoalsPage() {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Goal Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Set and track your financial goals
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewGoal}>
              <Target className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader className="hidden">
              <DialogTitle>
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </DialogTitle>
            </DialogHeader>
            <GoalForm
              onSuccess={handleFormSuccess}
              initialData={
                editingGoal
                  ? {
                      name: editingGoal.name,
                      description: editingGoal.description || undefined,
                      targetAmount: editingGoal.targetAmount,
                      deadline: editingGoal.deadline || undefined,
                    }
                  : undefined
              }
              isEditing={!!editingGoal}
              goalId={editingGoal?.id}
            />
          </DialogContent>
        </Dialog>
      </div>

      <GoalList onEditGoal={handleEditGoal} refreshTrigger={refreshTrigger} />
    </div>
  );
}
