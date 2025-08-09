import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn("w-64 h-full p-6 flex flex-col", className)}>
      {children}
    </div>
  );
}