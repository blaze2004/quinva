"use client";
import {
  ChartNoAxesGantt,
  CircleUserRound,
  HandCoins,
  Home,
  Users,
} from "lucide-react";
import { AppSidebar, SidebarProps } from "./app-sidebar";

export const sidebarData: SidebarProps = {
  subTitle: "Manage your expenses",
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Groups",
      url: "/groups",
      icon: Users,
    },
    {
      title: "Activity",
      url: "/activity",
      icon: ChartNoAxesGantt,
    },
    {
      title: "Settlements",
      url: "/settle",
      icon: HandCoins,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: CircleUserRound,
    },
  ],
  navSecondary: [],
};

export default function QuinvaSidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  return <AppSidebar collapsible="icon" {...sidebarData} user={user} />;
}
