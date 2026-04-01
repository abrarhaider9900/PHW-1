"use client";

import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { getEmbedUrl } from "@/utils/video";
import { formatMoney } from "@/utils/format";

function tablePlacingLabel(placing: number | null | undefined) {
  if (!placing) return "N/A";
  if (placing === 1) return "1st";
  if (placing === 2) return "2nd";
  if (placing === 3) return "3rd";
  return `${placing}th`;
}

export function Disciplines({
  disciplines,
  active,
  onChange,
}: {
  disciplines: string[];
  active: string | null;
  onChange: (d: string) => void;
}) {
  return (
    <div className="mt-10">
      <div className="text-[12px] font-extrabold uppercase tracking-wide text-[#141414]">
        Disciplines
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {disciplines.length > 0 ? (
          disciplines.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              className={[
                "min-w-[140px] rounded-full px-6 py-2.5 text-[12px] font-extrabold transition",
                active === d
                  ? "bg-[#8b3d24] text-white shadow-sm"
                  : "bg-[#e5e1d8] text-gray-500 hover:bg-[#d8d4cb]",
              ].join(" ")}
            >
              {d}
            </button>
          ))
        ) : (
          <div className="text-[13px] font-semibold text-[#999]">
            No disciplines recorded.
          </div>
        )}
      </div>
    </div>
  );
}

export function LatestVideo({
  videoUrl,
}: {
  videoUrl: string | null | undefined;
}) {
  return (
    <div className="mt-10">
      <div className="text-[12px] font-extrabold uppercase tracking-wide text-[#141414]">
        Latest Performance Video
      </div>
      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 text-center">
        {videoUrl ? (
          <div className="relative overflow-hidden rounded-2xl pt-[56.25%]">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
              title="Performance video"
            />
          </div>
        ) : (
          <div className="py-10 text-[#999]">
            <Play className="mx-auto mb-3 h-12 w-12 opacity-30" strokeWidth={1} />
            <div className="text-[13px] font-semibold">
              No video available for the latest performance.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PerformanceTable({
  performances,
}: {
  performances: any[];
}) {
  return (
    <div className="mt-10">
      <div className="text-[12px] font-extrabold uppercase tracking-wide text-[#141414]">
        Performance Stats
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fcfcfb]">
                {["Date", "Location", "Placing", "Earnings", "More Details"].map((h, idx) => (
                  <th
                    key={h}
                    className={[
                      "px-5 py-5 text-left text-[11px] font-extrabold uppercase tracking-wide text-[#999]",
                      idx === 4 ? "text-right" : "",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {performances.length > 0 ? (
                performances.map((perf: any) => (
                  <tr key={perf.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-5 text-[13px] font-extrabold text-[#141414]">
                      {perf.performance_date
                        ? new Date(perf.performance_date).toISOString().split("T")[0]
                        : "N/A"}
                    </td>
                    <td className="px-5 py-5 text-[13px] font-semibold text-[#666]">
                      {perf.city && perf.state
                        ? `${perf.city}, ${perf.state}`
                        : perf.city || perf.state || "N/A"}
                    </td>
                    <td className="px-5 py-5 text-[13px] font-extrabold text-[#141414]">
                      {tablePlacingLabel(perf.placing)}
                    </td>
                    <td className="px-5 py-5 text-[13px] font-extrabold text-[#141414]">
                      {formatMoney(perf.prize_money)}
                    </td>
                    <td className="px-5 py-5 text-right text-[13px]">
                      <Link
                        href={`/performances/${perf.id}`}
                        className="inline-flex items-center justify-end gap-1 font-extrabold text-[#8b3d24] hover:underline"
                      >
                        More Details <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[13px] font-semibold text-[#999]">
                    No performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

