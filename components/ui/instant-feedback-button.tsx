"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstantFeedbackButtonProps extends React.ComponentProps<typeof Button> {
  href?: string;
  replace?: boolean;
  children: React.ReactNode;
}

export function InstantFeedbackButton({ 
  href, 
  replace = false, 
  children, 
  onClick,
  disabled,
  className,
  ...props 
}: InstantFeedbackButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Execute any additional onClick logic first
    onClick?.(e);
    
    // Only navigate if href is provided and onClick didn't prevent default
    if (href && !e.defaultPrevented) {
      startTransition(() => {
        if (replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      });
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "relative",
        isPending && "opacity-75",
        className
      )}
    >
      {isPending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  );
}
