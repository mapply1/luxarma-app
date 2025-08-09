"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, AuthUser, UserRole } from "@/lib/auth";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface OptimizedProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
  showSkeletonImmediately?: boolean;
}

export function OptimizedProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/login",
  showSkeletonImmediately = true
}: OptimizedProtectedRouteProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(showSkeletonImmediately);
  const router = useRouter();

  useEffect(() => {
    // Show skeleton immediately for instant feedback
    if (showSkeletonImmediately) {
      setShowSkeleton(true);
    }

    const checkAuth = async () => {
      try {
        // Start auth check
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
        // Keep skeleton visible for a bit longer for smooth transition
        setTimeout(() => setShowSkeleton(false), 300);
      }
    };

    checkAuth();
  }, [router, requiredRole, fallbackPath, showSkeletonImmediately]);

  // Show skeleton immediately for instant feedback
  if (showSkeleton || loading) {
    return (
      <div className="min-h-screen">
        <PageSkeleton 
          showStats={true}
          showTable={true}
          showFilters={false}
          title="Chargement..."
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Suspense fallback={
      <PageSkeleton 
        showStats={true}
        showTable={true}
        showFilters={false}
        title="Chargement..."
      />
    }>
      {children}
    </Suspense>
  );
}
