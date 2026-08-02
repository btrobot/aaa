'use client';

import { cn } from '@/lib/utils';

interface SkeletonGridProps {
  count?: number;
  cols?: { default?: number; sm?: number; md?: number; lg?: number };
  className?: string;
}

export function SkeletonGrid({
  count = 8,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  className,
}: SkeletonGridProps) {
  const gridCols = `grid-cols-${cols.default ?? 1} sm:grid-cols-${cols.sm ?? 2} md:grid-cols-${cols.md ?? 3} lg:grid-cols-${cols.lg ?? 4}`;

  return (
    <div className={cn(`grid gap-6 ${gridCols}`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white">
          <div className="aspect-square rounded-t-lg bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}