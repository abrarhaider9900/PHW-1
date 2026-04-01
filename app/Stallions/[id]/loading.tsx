export default function LoadingHorseDetails() {
  return (
    <div className="bg-[#f8f7f2] py-10">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="aspect-[3/2] w-full animate-pulse rounded-2xl border border-gray-200 bg-white" />
          <div className="space-y-4">
            <div className="h-7 w-1/2 animate-pulse rounded bg-white" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-white" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-white" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="h-10 w-[140px] animate-pulse rounded-full bg-white" />
              <div className="h-10 w-[140px] animate-pulse rounded-full bg-white" />
              <div className="h-10 w-[140px] animate-pulse rounded-full bg-white" />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="h-10 w-[170px] animate-pulse rounded-full bg-white" />
              <div className="h-10 w-[170px] animate-pulse rounded-full bg-white" />
              <div className="h-10 w-[170px] animate-pulse rounded-full bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-5">
          <div className="h-4 w-32 animate-pulse rounded bg-white" />
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-[140px] animate-pulse rounded-full bg-white" />
            <div className="h-10 w-[140px] animate-pulse rounded-full bg-white" />
          </div>
          <div className="h-4 w-56 animate-pulse rounded bg-white" />
          <div className="h-[180px] w-full animate-pulse rounded-3xl border border-gray-200 bg-white" />
          <div className="h-4 w-40 animate-pulse rounded bg-white" />
          <div className="h-[260px] w-full animate-pulse rounded-3xl border border-gray-200 bg-white" />
        </div>
      </div>
    </div>
  );
}

