"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

export function LogoutButton({ className, variant = "ghost" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Clear session storage to show loading screen on next login
      sessionStorage.removeItem('luxarma-admin-loaded');
      sessionStorage.removeItem('luxarma-client-loaded');
      toast.success("Déconnecté avec succès");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? "Déconnexion..." : "Déconnexion"}
    </Button>
  );
}