"use client";

import { useState, useEffect } from "react";
import { Goal, GoalListResponse } from "@/lib/zod/goal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Filter,
  X,
  CheckCircle,
  Target,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface GoalListProps {
  onEditGoal?: (goal: Goal) => void;
  refreshTrigger?: number;
}

interface Filters {
  isCompleted: string;
  hasDeadline: string;
}

export default function GoalList({
  onEditGoal,
  refreshTrigger,
}: GoalListProps) {
  const [goals, setGoals] = useState<GoalListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    isCompleted: "all",
    hasDeadline: "all",
  });

  const fetchGoals = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (currentFilters.isCompleted && currentFilters.isCompleted !== "all")
        params.append("isCompleted", currentFilters.isCompleted);
      if (currentFilters.hasDeadline && currentFilters.hasDeadline !== "all")
        params.append("hasDeadline", currentFilters.hasDeadline);

      const response = await fetch(`/api/goals?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data: GoalListResponse = await response.json();
      setGoals(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this goal? Associated expenses will be unlinked."
      )
    )
      return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      toast.success("Goal deleted successfully");
      await fetchGoals(currentPage);
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/goals/${id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update goal");
      }

      toast.success(
        `Goal marked as ${!currentStatus ? "completed" : "incomplete"}`
      );
      await fetchGoals(currentPage);
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const handleFilterChange = (filterKey: keyof Filters, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchGoals(1, filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      isCompleted: "all",
      hasDeadline: "all",
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    fetchGoals(1, emptyFilters);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!goals) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load goals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Goals</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={filters.isCompleted}
                onValueChange={(value) =>
                  handleFilterChange("isCompleted", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Deadline</label>
              <Select
                value={filters.hasDeadline}
                onValueChange={(value) =>
                  handleFilterChange("hasDeadline", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All goals</SelectItem>
                  <SelectItem value="true">With deadline</SelectItem>
                  <SelectItem value="false">No deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-full flex gap-2">
              <Button onClick={applyFilters} size="sm">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {goals.goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No goals found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first goal to start tracking your savings!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.goals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      {goal.isCompleted && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {goal.isOverdue && !goal.isCompleted && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleComplete(goal.id, goal.isCompleted)
                      }
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditGoal?.(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {goal.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={goal.progressPercentage}
                    className="w-full"
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Amount</p>
                      <p className="font-medium">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Amount</p>
                      <p className="font-medium">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium">
                        {formatCurrency(goal.remainingAmount)}
                      </p>
                    </div>
                    {goal.deadline && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {goal.daysRemaining !== null &&
                          goal.daysRemaining >= 0
                            ? `${goal.daysRemaining} days left`
                            : "Deadline"}
                        </p>
                        <p className="font-medium">
                          {formatDate(goal.deadline)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {goals.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {(goals.pagination.page - 1) * goals.pagination.limit + 1}{" "}
              to{" "}
              {Math.min(
                goals.pagination.page * goals.pagination.limit,
                goals.pagination.total
              )}{" "}
              of {goals.pagination.total} goals
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchGoals(currentPage - 1)}
                disabled={!goals.pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="flex items-center px-3 text-sm">
                Page {goals.pagination.page} of {goals.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchGoals(currentPage + 1)}
                disabled={!goals.pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
