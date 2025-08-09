"use client";

"use client";

import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load the sidebar and loading screen
const ClientSidebar = lazy(() => import("@/components/client/client-sidebar").then(module => ({ default: module.ClientSidebar })));
const LoadingScreen = lazy(() => import("@/components/ui/loading-screen").then(module => ({ default: module.LoadingScreen })));

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading screen based on navigation type and session state
    const hasSeenLoading = sessionStorage.getItem('luxarma-client-loaded');
    const isPageReload = performance.navigation.type === 1; // 1 = reload/refresh
    const isFirstVisit = !hasSeenLoading;
    
    if (isFirstVisit || isPageReload) {
      setShowLoading(true);
    } else {
      // Client-side navigation (breadcrumbs, links) - no loading screen
      setShowLoading(false);
      sessionStorage.setItem('luxarma-client-loaded', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    sessionStorage.setItem('luxarma-client-loaded', 'true');
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
          <ClientSidebar />
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