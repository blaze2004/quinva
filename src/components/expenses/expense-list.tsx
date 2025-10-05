"use client";

import { Filter, IndianRupee, TrendingDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Expense,
  type ExpenseListResponse,
  SUGGESTED_CATEGORIES,
} from "@/lib/zod/expense";
import { ExpenseTable } from "./expense-table";

interface ExpenseListProps {
  onEditExpense?: (expense: Expense) => void;
  refreshTrigger?: number;
}

interface Filters {
  category: string;
  isRecurring: string;
  startDate: string;
  endDate: string;
}

export default function ExpenseList({
  onEditExpense,
  refreshTrigger,
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<ExpenseListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]); // Track cursor history for previous navigation
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    isRecurring: "all",
    startDate: "",
    endDate: "",
  });

  const fetchExpenses = async (
    cursor: string | null = null,
    currentFilters = filters,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: "10",
      });

      if (cursor) {
        params.append("cursor", cursor);
      }

      if (currentFilters.category && currentFilters.category !== "all")
        params.append("category", currentFilters.category);
      if (currentFilters.isRecurring && currentFilters.isRecurring !== "all")
        params.append("isRecurring", currentFilters.isRecurring);
      if (currentFilters.startDate)
        params.append(
          "startDate",
          new Date(currentFilters.startDate).toISOString(),
        );
      if (currentFilters.endDate)
        params.append(
          "endDate",
          new Date(currentFilters.endDate).toISOString(),
        );

      const response = await fetch(`/api/expenses?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data: ExpenseListResponse = await response.json();

      setExpenses(data);

      setCurrentCursor(data.pagination.nextCursor);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      toast.success("Expense deleted successfully");
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleFilterChange = (filterKey: keyof Filters, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentCursor(null);
    setPageHistory([null]);
    setCurrentPage(1);
    fetchExpenses(null, filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: "all",
      isRecurring: "all",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    setCurrentCursor(null);
    setPageHistory([null]);
    setCurrentPage(1);
    fetchExpenses(null, emptyFilters);
    setShowFilters(false);
  };

  const goToNextPage = () => {
    if (currentCursor) {
      // Add current cursor to history for previous navigation
      setPageHistory((prev) => [...prev, currentCursor]);
      setCurrentPage((prev) => prev + 1);
      fetchExpenses(currentCursor, filters);
    }
  };

  const goToPreviousPage = () => {
    if (pageHistory.length > 1) {
      // Remove current page from history and go to previous
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current
      const previousCursor = newHistory[newHistory.length - 1];

      setPageHistory(newHistory);
      setCurrentPage((prev) => prev - 1);
      fetchExpenses(previousCursor, filters);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  if (loading && !expenses) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Expenses
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Skeleton className="h-10 w-80" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-6 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-12" />
                    </TableHead>
                    <TableHead className="w-[100px]">
                      <Skeleton className="h-6 w-16" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expenses) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Failed to load expenses</h3>
              <p className="text-muted-foreground">
                Please try refreshing the page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Expenses
          </CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {SUGGESTED_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select
                value={filters.isRecurring}
                onValueChange={(value) =>
                  handleFilterChange("isRecurring", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="true">Recurring</SelectItem>
                  <SelectItem value="false">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
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
        {expenses.expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <IndianRupee className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No expenses yet</h3>
                <p className="text-muted-foreground">
                  Start tracking your spending by adding your first expense.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ExpenseTable
            data={expenses.expenses}
            onEditExpense={onEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            hasNext={expenses.pagination.hasNext}
            hasPrevious={currentPage > 1}
            isLoading={loading}
            totalCount={expenses.pagination.total}
            currentPage={currentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
