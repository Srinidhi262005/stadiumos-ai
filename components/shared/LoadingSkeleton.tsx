'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export function LoadingSkeleton({ className, rows = 1 }: LoadingSkeletonProps) {
  if (rows > 1) {
    return (
      <div className="space-y-3.5 w-full select-none" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-[#101827] border border-[#1E293B] rounded shimmer-shimmer w-full",
              i === rows - 1 && "w-[80%]",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-4 bg-[#101827] border border-[#1E293B] rounded shimmer-shimmer w-full select-none",
        className
      )}
      aria-hidden="true"
    />
  );
}

export default LoadingSkeleton;
