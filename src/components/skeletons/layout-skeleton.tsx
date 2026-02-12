import { Skeleton } from '@/components/ui/skeleton';

export function LayoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
      {/* Content area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
