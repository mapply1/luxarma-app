"use client";

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstantFeedbackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  showSpinner?: boolean;
  replace?: boolean;
}

export function InstantFeedbackLink({ 
  href, 
  children, 
  className, 
  onClick,
  showSpinner = true,
  replace = false 
}: InstantFeedbackLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Execute any additional onClick logic
    onClick?.();
    
    // Start transition for immediate feedback
    startTransition(() => {
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    });
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={cn(
        "relative transition-opacity",
        isPending && "opacity-75 pointer-events-none",
        className
      )}
    >
      {children}
      {isPending && showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      )}
    </Link>
  );
}
