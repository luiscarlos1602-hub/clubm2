import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { BRAND_COPY } from "./brand-copy";
import type { MoneyDisplayProps } from "./MoneyDisplay";
import type { TestIdProp } from "./types";

export type TextSkeletonProps = TestIdProp & { lines?: 1 | 2 | 3 | 4 | 5 | 6 };
export type MoneySkeletonProps = TestIdProp & { size?: MoneyDisplayProps["size"] };
export type CardSkeletonProps = TestIdProp;

const MONEY_HEIGHT = { sm: "h-4 w-20", md: "h-6 w-28", lg: "h-8 w-36", xl: "h-12 w-52" } as const;

function Loading() {
  return <span className="sr-only">{BRAND_COPY.loading}</span>;
}

export function TextSkeleton({ lines = 3, className, "data-testid": testId = "skeleton-text" }: TextSkeletonProps) {
  return (
    <div role="status" data-testid={testId} className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")} />
      ))}
      <Loading />
    </div>
  );
}

export function MoneySkeleton({ size = "md", className, "data-testid": testId = "skeleton-money" }: MoneySkeletonProps) {
  return (
    <div role="status" data-testid={testId} className={cn("flex flex-col gap-2", className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className={MONEY_HEIGHT[size]} />
      <Loading />
    </div>
  );
}

export function CardSkeleton({ className, "data-testid": testId = "skeleton-card" }: CardSkeletonProps) {
  return (
    <div role="status" data-testid={testId} className={cn("flex flex-col gap-4 rounded-md border border-border bg-card p-5", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-3/4" />
      <TextSkeleton lines={2} data-testid="skeleton-card-text" />
      <Skeleton className="h-10 w-32" />
      <Loading />
    </div>
  );
}
