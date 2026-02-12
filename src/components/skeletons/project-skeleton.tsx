import { Skeleton } from '@/components/ui/skeleton';

function BugCardSkeleton() {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

function ColumnSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className="w-72 flex flex-col rounded-lg bg-muted/50 border">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>
      <div className="flex-1 p-2 space-y-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <BugCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProjectPageSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-48 rounded-md hidden sm:block" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max justify-center mx-auto">
          <ColumnSkeleton cardCount={3} />
          <ColumnSkeleton cardCount={2} />
          <ColumnSkeleton cardCount={2} />
          <ColumnSkeleton cardCount={1} />
          <ColumnSkeleton cardCount={2} />
        </div>
      </div>
    </div>
  );
}
