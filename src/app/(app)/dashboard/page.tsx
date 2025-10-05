"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target,
  Wallet,
  PieChart,
  Calendar,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  expenses: {
    total: number;
    totalAmount: number;
    thisMonth: number;
    lastMonth: number;
    byCategory: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
  budgets: {
    total: number;
    completed: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    averageProgress: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");

      if (!response.ok) {
        toast.error("Failed to fetch dashboard stats");
      }

      const data: DashboardStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateMonthlyChange = () => {
    if (!stats || stats.expenses.lastMonth === 0) return 0;
    return (
      ((stats.expenses.thisMonth - stats.expenses.lastMonth) /
        stats.expenses.lastMonth) *
      100
    );
  };

  const getTopCategories = () => {
    if (!stats) return [];
    return stats.expenses.byCategory.slice(0, 5);
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your expenses and budgets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const monthlyChange = calculateMonthlyChange();
  const topCategories = getTopCategories();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your expenses and budgets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.expenses.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.expenses.total} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.expenses.thisMonth)}
            </div>
            <div className="flex items-center text-xs">
              {monthlyChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span
                className={
                  monthlyChange > 0 ? "text-red-500" : "text-green-500"
                }
              >
                {Math.abs(monthlyChange).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budgets Progress
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.budgets.averageProgress.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.budgets.completed}/{stats.budgets.total} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spending</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.budgets.totalCurrentAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(stats.budgets.totalTargetAmount)} target
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expense data available
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.map((category, index) => {
                  const percentage =
                    stats.expenses.totalAmount > 0
                      ? (category.amount / stats.expenses.totalAmount) * 100
                      : 0;

                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getCategoryColor(index)}`}
                          />
                          <span className="text-sm font-medium">
                            {category.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatCurrency(category.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {category.count} expenses
                          </div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budgets Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.budgets.total === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No budgets created yet
              </p>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {stats.budgets.averageProgress.toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground">Average Progress</p>
                  <Progress
                    value={stats.budgets.averageProgress}
                    className="mt-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.budgets.completed}
                    </div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.budgets.total - stats.budgets.completed}
                    </div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Saved
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(stats.budgets.totalCurrentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Target
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(stats.budgets.totalTargetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Remaining
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(
                        stats.budgets.totalTargetAmount -
                          stats.budgets.totalCurrentAmount
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
