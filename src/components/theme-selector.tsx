"use client";
import { LaptopIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonIcon } from "@/components/ui/icons/moon";
import { SunIcon } from "@/components/ui/icons/sun";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  className?: string;
  variant?: "icon" | "extended";
}

const ThemeSelector = ({ className, variant = "icon" }: ThemeSelectorProps) => {
  const { theme, setTheme } = useTheme();

  if (variant === "extended") {
    return (
      <Select value={theme} defaultValue="system" onValueChange={setTheme}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <SunIcon className="mr-2" /> Light
          </SelectItem>
          <SelectItem value="dark">
            <MoonIcon className="mr-2" /> Dark
          </SelectItem>
          <SelectItem value="system">
            <LaptopIcon className="mr-2" /> System
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Button
      variant={"secondary"}
      className={cn("px-2 py-2 rounded-md", className)}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === undefined ? (
        <LaptopIcon />
      ) : theme === "dark" ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </Button>
  );
};

export default ThemeSelector;
