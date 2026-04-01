"use client";

import { useMemo, useState } from "react";
import type { Horse } from "@/types/database";
import HorseGallery from "@/components/horses/details/HorseGallery";
import HorseHeader from "@/components/horses/details/HorseHeader";
import { Disciplines, LatestVideo, PerformanceTable } from "@/components/horses/details/HorseStats";
import {
  Edit,
  Flag,
  GitBranch,
  PlusCircle,
  Printer,
  Share2,
  UserPlus,
} from "lucide-react";

export default function HorseDetails({
  horse,
  performances,
  isLoggedIn,
  canOwnerView,
}: {
  horse: Horse & { owner?: any; trainer?: any };
  performances: any[];
  isLoggedIn: boolean;
  canOwnerView: boolean;
}) {
  const publicOnly = !isLoggedIn || !canOwnerView;
  const [viewType, setViewType] = useState<"public" | "owner">(publicOnly ? "public" : "owner");

  const totalLTE = useMemo(
    () => performances.reduce((sum: number, p: any) => sum + (p?.prize_money || 0), 0),
    [performances]
  );

  const disciplines = useMemo(() => {
    const list = performances
      .map((p: any) => p?.discipline?.name)
      .filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [performances]);

  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(disciplines[0] ?? null);
  const latestPerf = performances?.[0];

  const outlineBtn =
    "inline-flex min-w-[140px] items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[12px] font-extrabold text-[#444] shadow-sm transition hover:bg-gray-50";
  const primaryBtn =
    "inline-flex min-w-[170px] items-center justify-center rounded-full bg-[#8b3d24] px-6 py-2.5 text-[12px] font-extrabold text-white shadow-sm transition hover:bg-[#a64a2b]";

  return (
    <div className="bg-[#f8f7f2] py-10">
      <div className="container">
        <div className="relative mb-10">
          {!publicOnly && (
            <div className="mb-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewType("owner")}
                className={[
                  "w-[140px] rounded-xl px-6 py-2 text-[12px] font-extrabold transition",
                  viewType === "owner"
                    ? "bg-[#8b3d24] text-white shadow-md"
                    : "bg-[#e5e1d8] text-gray-500 hover:bg-[#d8d4cb]",
                ].join(" ")}
              >
                Owner View
              </button>
              <button
                type="button"
                onClick={() => setViewType("public")}
                className={[
                  "w-[140px] rounded-xl px-6 py-2 text-[12px] font-extrabold transition",
                  viewType === "public"
                    ? "bg-[#8b3d24] text-white shadow-md"
                    : "bg-[#e5e1d8] text-gray-500 hover:bg-[#d8d4cb]",
                ].join(" ")}
              >
                Public View
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            <HorseGallery name={horse.name} imageUrl={horse.image_url} />

            <div className="flex flex-col justify-center">
              <HorseHeader horse={horse} totalLTE={totalLTE} />

              {/* Action buttons row (Share/Follow/Report) */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className={outlineBtn}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </button>
                <button type="button" className={outlineBtn}>
                  <UserPlus className="mr-2 h-4 w-4" /> Follow
                </button>
                <button type="button" className={outlineBtn}>
                  <Flag className="mr-2 h-4 w-4" /> Report
                </button>
              </div>

              {/* Primary actions */}
              <div className="mt-4">
                {viewType === "public" ? (
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className={primaryBtn}>
                      View Pedigree
                    </button>
                    <button type="button" className={primaryBtn}>
                      <Printer className="mr-2 h-4 w-4" /> Print Stats
                    </button>
                    <button type="button" className={primaryBtn}>
                      <Share2 className="mr-2 h-4 w-4" /> Share Horse
                    </button>
                  </div>
                ) : (
                  <div className="max-w-[520px]">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button type="button" className={primaryBtn}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Performance
                      </button>
                      <button type="button" className={primaryBtn}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </button>
                      <button type="button" className={primaryBtn}>
                        <GitBranch className="mr-2 h-4 w-4" /> Pedigree (Link to Pedigree/Add)
                      </button>
                      <button type="button" className={primaryBtn}>
                        <Printer className="mr-2 h-4 w-4" /> Print Stats
                      </button>
                    </div>
                    <div className="mt-3">
                      <button type="button" className={primaryBtn}>
                        <Share2 className="mr-2 h-4 w-4" /> Share Horse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Disciplines
            disciplines={disciplines.length ? disciplines : ["Barrel Racing", "Team Roping"]}
            active={activeDiscipline}
            onChange={setActiveDiscipline}
          />
          <LatestVideo videoUrl={latestPerf?.video_url} />
          <PerformanceTable performances={performances} />
        </div>
      </div>
    </div>
  );
}

