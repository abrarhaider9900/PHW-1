"use client";

import Link from "next/link";

export default function RestrictedOverlay({
  title = "Login to view full details",
  description = "Some horse details are restricted. Please login or create an account to continue.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-lg backdrop-blur">
        <div className="text-center">
          <div className="text-[16px] font-extrabold text-[#141414]">{title}</div>
          <div className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-600">
            {description}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#8b3d24] px-5 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition-all hover:bg-[#a64a2b]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#444] shadow-sm transition-all hover:bg-gray-50"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

