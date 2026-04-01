"use client";

import { formatMoney, horseHeadline } from "@/utils/format";
import type { Horse } from "@/types/database";

export default function HorseHeader({
  horse,
  totalLTE,
}: {
  horse: Horse & { owner?: any; trainer?: any };
  totalLTE: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[22px] font-extrabold text-[#8b3d24] sm:text-[26px]">
          {horse.name}
        </div>
        <div className="mt-0.5 text-[12px] font-extrabold text-[#8b3d24]">
          LTE: {formatMoney(totalLTE)}
        </div>
      </div>

      <div className="text-[12px] font-semibold leading-relaxed text-[#666]">
        <div>{horseHeadline(horse.color || horse.breed, horse.sex, horse.birth_year, horse.registry)}</div>

        <div>
          <div>
            <span className="font-extrabold text-[#141414]">Owner:</span>{" "}
            <span className="font-extrabold text-[#8b3d24]">
              {horse.owner?.full_name || "N/A"}
            </span>
          </div>
          <div>
            <span className="font-extrabold text-[#141414]">Trainer:</span>{" "}
            <span className="font-extrabold text-[#8b3d24]">
              {horse.trainer?.name || "N/A"}
            </span>
          </div>
          <div>
            <span className="font-extrabold text-[#141414]">Pedigree:</span>{" "}
            <span className="font-extrabold text-[#8b3d24]">
              {[horse.sire, horse.dam].filter(Boolean).join(" x ") || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

