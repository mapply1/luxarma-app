"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, AuthUser, UserRole } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/login" 
}: ProtectedRouteProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          const currentPath = window.location.pathname;
          router.push(`${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        if (requiredRole && currentUser.role !== requiredRole) {
          // Redirect based on user's actual role
          if (currentUser.role === 'admin') {
            router.push('/admin');
          } else if (currentUser.role === 'client') {
            router.push('/app');
          } else {
            router.push(fallbackPath);
          }
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(fallbackPath);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole, fallbackPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}