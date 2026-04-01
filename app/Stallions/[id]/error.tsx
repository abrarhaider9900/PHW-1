"use client";

export default function StallionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-[#f8f7f2] py-16">
      <div className="container">
        <div className="mx-auto max-w-[900px] rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="text-[12px] font-extrabold tracking-[0.14em] text-[#999]">
            HORSE PROFILE
          </div>
          <h1 className="mt-2 text-[28px] font-black text-[#141414] sm:text-[34px]">
            Something went wrong
          </h1>
          <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[#666]">
            We couldn&apos;t load this horse profile right now. Please try again.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-[#8b3d24] px-5 py-3 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#a64a2b]"
            >
              Retry
            </button>
            <a
              href="/allhorses"
              className="rounded-full border border-gray-200 bg-white px-5 py-3 text-[13px] font-extrabold text-[#444] shadow-sm transition hover:bg-gray-50"
            >
              Browse Horses
            </a>
          </div>

          <div className="mt-6 text-[11px] font-semibold text-[#999]">
            {error?.digest ? `Ref: ${error.digest}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

