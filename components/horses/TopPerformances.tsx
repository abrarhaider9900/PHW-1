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
                return { label: name, placeholder: "/images/placeholder.jpg" };
        }
    }

    return (
        <div style={{ marginBottom: "50px" }}>
            {/* Section Header */}
            <div className="section-header" style={{ marginBottom: "30px", borderBottom: "1px solid #e4e4e4", paddingBottom: "12px" }}>
                <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#071437" }}>
                    Top Performances — Month
                </h4>
            </div>

            {/* Performance cards grid — 2 columns */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "24px 20px" 
            }}>
                {allEntries.length > 0 ? (
                    allEntries.map(({ discipline, perf }, idx) => {
                        const { label, placeholder } = getDisciplineInfo(discipline.name);
                        
                        return (
                            <Link
                                key={`${discipline.id}-${perf.id ?? idx}`}
                                href={`/Stallions/${perf.horse_id}`}
                                style={{
                                    display: "flex",
                                    background: "#ffffff",
                                    textDecoration: "none",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    border: "1px solid #e4e4e4",
                                    transition: "0.3s transform",
                                    height: "135px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.08)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                }}
                            >
                                {/* Image Container */}
                                <div style={{ width: "155px", height: "100%", position: "relative", flexShrink: 0 }}>
                                    <Image
                                        src={perf.horse?.image_url || placeholder}
                                        alt={perf.horse?.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>

                                {/* Content Container */}
                                <div style={{
                                    padding: "16px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    flex: 1,
                                }}>
                                    {/* Discipline name */}
                                    <div style={{
                                        fontSize: "14px",
                                        color: "#666",
                                        fontWeight: "500",
                                        marginBottom: "8px",
                                    }}>
                                        {label}
                                    </div>

                                    {/* Horse name + prize money */}
                                    <h3 style={{
                                        fontSize: "16px",
                                        fontWeight: "700",
                                        margin: "0 0 10px",
                                        color: "#071437",
                                        lineHeight: "1.2",
                                    }}>
                                        {perf.horse?.name}{perf.prize_money ? ` • ${formatMoney(perf.prize_money)}` : ""}
                                    </h3>

                                    {/* Trainer Link-like text */}
                                    <div style={{
                                        fontSize: "14.5px",
                                        color: "#e7a431",
                                        fontWeight: "800",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px",
                                    }}>
                                        Trainer: {perf.horse?.trainer?.name || "Unknown"}
                                        <ChevronRight size={16} strokeWidth={3} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div style={{
                        gridColumn: "span 2",
                        padding: "50px",
                        textAlign: "center",
                        color: "#999",
                        background: "#fff",
                        border: "1px dashed #ccc",
                        borderRadius: "10px",
                    }}>
                        No top performances recorded this month.
                    </div>
                )}
            </div>
        </div>
    );
}