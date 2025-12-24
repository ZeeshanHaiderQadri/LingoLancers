/**
 * Skeleton loader for blog article cards
 * Matches exact proportions of real blog article cards
 * Shows individual lines for title, workflow ID, and metadata
 */

export function ArticleCardSkeleton() {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors animate-pulse">
      <div className="flex-1">
        {/* Title and status badge */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-5 bg-gray-300 rounded w-64"></div>
          <div className="h-5 bg-gray-300 rounded-full w-12"></div>
        </div>
        
        {/* Workflow ID line */}
        <div className="h-3 bg-gray-300 rounded w-48 mb-2"></div>
        
        {/* Stats line - Created date and word count */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="h-8 bg-gray-300 rounded w-16"></div>
        <div className="h-8 w-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

export function ArticleCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}