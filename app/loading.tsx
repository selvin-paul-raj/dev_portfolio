export default function Loading() {
  return (
    <div className="flex flex-col items-center px-4 w-full max-w-5xl mx-auto pt-8 animate-pulse">
      {/* Hero row */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16 mb-14">
        <div className="flex-1 flex flex-col items-center lg:items-start gap-4 w-full">
          <div className="h-7 w-36 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="h-14 w-3/4 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-16 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
          <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
          <div className="flex gap-3 mt-1 w-full">
            <div className="h-11 w-32 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="h-11 w-32 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
        <div className="w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-3 gap-3 mb-8">
        <div className="h-20 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="col-span-2 h-20 rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>

      {/* Badges */}
      <div className="w-full flex gap-2 flex-wrap mb-12">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
        ))}
      </div>
    </div>
  );
}
