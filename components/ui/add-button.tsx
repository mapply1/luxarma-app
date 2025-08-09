"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
}

export function AddButton({ children, size = "default", variant = "default", className, ...props }: AddButtonProps) {
  if (variant === "outline") {
    return (
      <Button
        className={cn(
          "border-[#0c120d] text-[#0c120d] hover:bg-[#0c120d] hover:text-white transition-colors duration-200",
          className
        )}
        variant="outline"
        size={size}
        {...props}
      >
        <Plus className="mr-2 h-4 w-4" />
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={cn(
        "bg-[#0c120d] text-white hover:bg-blue-600 transition-colors duration-200 font-medium",
        className
      )}
      size={size}
      {...props}
    >
      <Plus className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}