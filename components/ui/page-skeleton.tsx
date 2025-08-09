interface PageSkeletonProps {
  showStats?: boolean;
  showTable?: boolean;
  showTabs?: boolean;
  showFilters?: boolean;
  title?: string;
}

export function PageSkeleton({ 
  showStats = true, 
  showTable = true, 
  showTabs = false,
  showFilters = false,
  title = "Chargement..."
}: PageSkeletonProps) {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      {/* Filters if needed */}
      {showFilters && (
        <div className="flex gap-4">
          <div className="h-10 bg-slate-200 rounded flex-1 max-w-md"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
      )}

      {/* Stats cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded"></div>
          ))}
        </div>
      )}

      {/* Tabs if needed */}
      {showTabs && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-slate-200 rounded w-24"></div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      {showTable ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 rounded w-48"></div>
            <div className="h-10 bg-slate-200 rounded w-32"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      ) : (
        <div className="h-64 bg-slate-200 rounded"></div>
      )}
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
        <div className="h-4 bg-slate-200 rounded w-4"></div>
        <div className="h-4 bg-slate-200 rounded w-20"></div>
        <div className="h-4 bg-slate-200 rounded w-4"></div>
        <div className="h-4 bg-slate-200 rounded w-32"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 bg-slate-200 rounded w-20"></div>
            <div className="h-6 bg-slate-200 rounded w-32"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 rounded w-32"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-slate-200 rounded w-24"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}

export function ClientProjectSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Project header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-slate-200 rounded"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="flex items-center gap-6">
          <div className="h-6 bg-slate-200 rounded w-20"></div>
          <div className="h-6 bg-slate-200 rounded w-32"></div>
          <div className="h-6 bg-slate-200 rounded w-24"></div>
        </div>
      </div>

      {/* Tables */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}