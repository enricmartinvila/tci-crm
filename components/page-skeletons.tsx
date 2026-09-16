import { Skeleton } from "@/components/ui/skeleton";
import { DEAL_STAGES } from "@/lib/constants";

export function PageHeaderSkeleton({
  subtitle = true,
}: {
  subtitle?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      {subtitle ? <Skeleton className="h-4 w-72 max-w-full" /> : null}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-3 h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="tci-panel space-y-3 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="tci-panel space-y-3 p-5 lg:col-span-3">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="tci-panel space-y-3 p-5 lg:col-span-2">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-6" />
              </div>
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="tci-panel space-y-3 p-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeaderSkeleton />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="border-b bg-muted/40 px-4 py-3">
          <div className="flex gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-4 py-3.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DealsPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex gap-3 overflow-hidden pb-2">
        {DEAL_STAGES.slice(0, 6).map((stage) => (
          <div
            key={stage}
            className="flex w-64 shrink-0 flex-col rounded-lg border bg-muted/30"
          >
            <div className="space-y-1 border-b px-3 py-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-md border bg-background p-3"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="tci-panel space-y-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="tci-panel space-y-4 p-5">
            <Skeleton className="h-5 w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-xl border p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="tci-panel space-y-3 p-5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FollowUpsSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="tci-panel space-y-3 p-5">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
