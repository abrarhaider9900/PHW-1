"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/utils/format";
import { ChevronRight } from "lucide-react";
import type { Discipline } from "@/types/database";

interface TopPerformancesProps {
    disciplines: Discipline[];
    performancesByDiscipline: Record<string, any[]>;
}

export default function TopPerformances({
    disciplines,
    performancesByDiscipline,
}: TopPerformancesProps) {
    // Only take the TOP performance for each discipline
    const allEntries: { discipline: Discipline; perf: any }[] = [];

    disciplines.forEach((d) => {
        const perfs = performancesByDiscipline[d.id] ?? [];
        if (perfs.length > 0) {
            // Take the first one (already sorted by prize_money desc in page.tsx)
            allEntries.push({ discipline: d, perf: perfs[0] });
        }
    });

    // Take only the first 5 entries if there are many, or just keep all if few
    const displayEntries = allEntries.slice(0, 6);

    // Helper to format discipline name and get placeholder
    const getDisciplineInfo = (name: string) => {
        switch (name) {
            case "Barrel Racing":
                return {
                    label: "Barrel Racing",
                    placeholder: "/images/disciplines/barrel_racing.png"
                };
            case "Tie-Down Roping":
                return {
                    label: "Tie-Down",
                    placeholder: "/images/disciplines/tie_down.png"
                };
            case "Team Roping":
                return {
                    label: "Team Roping",
                    placeholder: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=800"
                };
            case "Reining":
                return {
                    label: "Reining",
                    placeholder: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=800"
                };
            case "Cutting":
                return {
                    label: "Cutting",
                    placeholder: "https://images.unsplash.com/photo-1601989398759-29ec98715f6a?q=80&w=800"
                };
            default:
                return { label: name, placeholder: "/images/header-banner.png" };
        }
    }

    return (
        <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid #f0f0f0",
            marginBottom: "40px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}>
            {/* Section Header */}
            <div style={{ marginBottom: "28px" }}>
                <h4 style={{
                    fontSize: "20px",
                    fontWeight: "850",
                    color: "#071437",
                    letterSpacing: "-0.02em"
                }}>
                    Top Performances — Month
                </h4>
            </div>

            {/* Performance cards grid — Responsive columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayEntries.length > 0 ? (
                    displayEntries.map(({ discipline, perf }, idx) => {
                        const { label, placeholder } = getDisciplineInfo(discipline.name);

                        return (
                            <Link
                                key={`${discipline.id}-${perf.id ?? idx}`}
                                href={`/Stallions/${perf.horse_id}`}
                                className="premium-card-hover"
                                style={{
                                    display: "flex",
                                    background: "#f8fafb",
                                    textDecoration: "none",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    transition: "all 0.3s ease",
                                    padding: "10px",
                                }}
                            >
                                {/* Image Container */}
                                <div style={{
                                    width: "80px",
                                    height: "80px",
                                    position: "relative",
                                    flexShrink: 0,
                                    borderRadius: "12px",
                                    overflow: "hidden"
                                }} className="sm:w-[110px] sm:h-[110px]">
                                    <Image
                                        src={perf.horse_image_url || "/images/header-banner.png"}
                                        alt={perf.horse_name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>

                                {/* Content */}
                                <div style={{
                                    padding: "4px 12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    flex: 1
                                }}>
                                    <div style={{
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        color: "#888",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.02em",
                                        marginBottom: "2px"
                                    }} className="sm:text-[12px]">
                                        {label}
                                    </div>
                                    <h3 style={{
                                        fontWeight: "800",
                                        margin: "0 0 4px",
                                        color: "#071437",
                                        lineHeight: "1.2"
                                    }} className="text-[14px] sm:text-[15px]">
                                        {perf.horse_name} • ${Number(perf.prize_money).toLocaleString()}
                                    </h3>
                                    <div style={{
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        color: "#00a884",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px"
                                    }} className="sm:text-[13px]">
                                        Trainer: {perf.trainer_name} <ChevronRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div style={{
                        gridColumn: "1 / -1",
                        padding: "40px",
                        textAlign: "center",
                        color: "#999",
                        background: "#fff",
                        border: "1px dashed #e0e0e0",
                        borderRadius: "16px",
                    }}>
                        No top performances recorded this month.
                    </div>
                )}
            </div>
        </div>
    );
}

