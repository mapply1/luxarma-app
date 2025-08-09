"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

let isNavigating = false;
let navigationStartTime = 0;

export function useNavigationFeedback() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Mark navigation as complete when pathname or search params change
    if (isNavigating) {
      const navigationTime = Date.now() - navigationStartTime;
      console.log(`Navigation completed in ${navigationTime}ms`);
      isNavigating = false;
      
      // Remove the loading class from body
      document.body.classList.remove('luxarma-navigating');
    }
  }, [pathname, searchParams]);

  const startNavigation = () => {
    isNavigating = true;
    navigationStartTime = Date.now();
    
    // Add loading class to body for global loading state
    document.body.classList.add('luxarma-navigating');
  };

  const navigate = (href: string) => {
    startNavigation();
    router.push(href);
  };

  return {
    navigate,
    isNavigating: () => isNavigating,
    startNavigation,
  };
}

export function getNavigationState() {
  return isNavigating;
}
