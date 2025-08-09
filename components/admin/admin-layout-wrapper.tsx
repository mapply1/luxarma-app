"use client";

"use client";

import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load the sidebar and loading screen
const AdminSidebar = lazy(() => import("@/components/admin/admin-sidebar").then(module => ({ default: module.AdminSidebar })));
const LoadingScreen = lazy(() => import("@/components/ui/loading-screen").then(module => ({ default: module.LoadingScreen })));

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading screen based on navigation type and session state
    const hasSeenLoading = sessionStorage.getItem('luxarma-admin-loaded');
    const isPageReload = performance.navigation.type === 1; // 1 = reload/refresh
    const isFirstVisit = !hasSeenLoading;
    
    if (isFirstVisit || isPageReload) {
      setShowLoading(true);
    } else {
      // Client-side navigation (breadcrumbs, links) - no loading screen
      setShowLoading(false);
      sessionStorage.setItem('luxarma-admin-loaded', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    sessionStorage.setItem('luxarma-admin-loaded', 'true');
  };

  return (
    <>
      {showLoading && (
        <Suspense fallback={<div className="min-h-screen bg-blue-600 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
          <LoadingScreen onComplete={handleLoadingComplete} />
        </Suspense>
      )}
      <div className="flex h-screen bg-blue-600">
        <Suspense fallback={<div className="w-64 bg-blue-700 animate-pulse"></div>}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 p-6">
          <div className="h-full bg-[#f7f7f7] rounded-3xl overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}