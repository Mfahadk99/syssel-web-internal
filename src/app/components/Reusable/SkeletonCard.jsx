const SkeletonCard = () => {
  return (
    <div className="animate-pulse">
      <div
        className="relative flex flex-col h-[420px] sm:h-[450px] w-full bg-white 
          rounded-2xl border border-gray-100 overflow-hidden"
      >
        {/* Image Skeleton */}
        <div className="relative h-[200px] sm:h-[250px] w-full bg-gray-200"></div>

        {/* Content Skeleton */}
        <div className="flex flex-col flex-grow p-4 space-y-3">
          {/* Brand Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>

          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
