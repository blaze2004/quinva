"use client";
import { Book, CircleUserRound, Home, Receipt, Target } from "lucide-react";
import { AppSidebar, type SidebarProps } from "./app-sidebar";

export const sidebarData: SidebarProps = {
  subTitle: "Manage your expenses",
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: Receipt,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: Target,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: CircleUserRound,
    },
  ],
  navSecondary: [
    {
      title: "API Docs",
      url: "/api/docs",
      icon: Book,
    },
  ],
};

export default function QuinvaSidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  return <AppSidebar collapsible="icon" {...sidebarData} user={user} />;
}
