"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Budget, BudgetListResponse } from "@/lib/zod/budget";

interface BudgetListProps {
  onEditBudget?: (budget: Budget) => void;
  refreshTrigger?: number;
}

interface Filters {
  isCompleted: string;
  hasDeadline: string;
}

export default function BudgetList({
  onEditBudget,
  refreshTrigger,
}: BudgetListProps) {
  const [budgets, setBudgets] = useState<BudgetListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    isCompleted: "all",
    hasDeadline: "all",
  });

  const fetchBudgets = async (page = 1, currentFilters = filters) => {
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

      const response = await fetch(`/api/budgets?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data: BudgetListResponse = await response.json();
      setBudgets(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this budget? Associated expenses will be unlinked.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      toast.success("Budget deleted successfully");
      await fetchBudgets(currentPage);
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  const handleFilterChange = (filterKey: keyof Filters, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchBudgets(1, filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      isCompleted: "all",
      hasDeadline: "all",
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    fetchBudgets(1, emptyFilters);
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
    fetchBudgets();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!budgets) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load budgets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Budgets</CardTitle>
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
                  <SelectValue placeholder="All budgets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All budgets</SelectItem>
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
        {budgets.budgets.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No budgets found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first budget to start tracking your expenses!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.budgets.map((budget) => (
              <div
                key={budget.id}
                className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{budget.name}</h3>
                      {budget.isCompleted && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {budget.isOverdue && !budget.isCompleted && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    {budget.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {budget.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditBudget?.(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span className="font-medium">
                      {budget.spentPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={budget.spentPercentage} className="w-full" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount Spent</p>
                      <p className="font-medium">
                        {formatCurrency(budget.currentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget Limit</p>
                      <p className="font-medium">
                        {formatCurrency(budget.targetAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium">
                        {formatCurrency(budget.remainingAmount)}
                      </p>
                    </div>
                    {budget.deadline && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {budget.daysRemaining !== null &&
                          budget.daysRemaining >= 0
                            ? `${budget.daysRemaining} days left`
                            : "Deadline"}
                        </p>
                        <p className="font-medium">
                          {formatDate(budget.deadline)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {budgets.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {(budgets.pagination.page - 1) * budgets.pagination.limit + 1} to{" "}
              {Math.min(
                budgets.pagination.page * budgets.pagination.limit,
                budgets.pagination.total,
              )}{" "}
              of {budgets.pagination.total} budgets
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBudgets(currentPage - 1)}
                disabled={!budgets.pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="flex items-center px-3 text-sm">
                Page {budgets.pagination.page} of{" "}
                {budgets.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBudgets(currentPage + 1)}
                disabled={!budgets.pagination.hasNext}
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
