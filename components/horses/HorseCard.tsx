"use client";

import FollowButton from "@/components/horses/FollowButton";
import { horseHeadline } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface HorseCardProps {
    horse: any;
}

export default function HorseCard({ horse }: HorseCardProps) {
    const headline = horseHeadline(
        horse.color,
        horse.sex,
        horse.birth_year,
        horse.registry
    );

    return (
        <Link
            href={`/Stallions/${horse.id}`}
            className="features-style-item border border-gray-200 bg-white rounded-[10px] overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md"
            style={{
                textDecoration: "none",
                display: "flex",
                marginBottom: "20px",
            }}
        >
            {/* Image */}
            <div className="features-image" style={{ width: "160px", height: "140px", position: "relative", flexShrink: 0 }}>
                {horse.image_url ? (
                    <Image
                        src={horse.image_url}
                        alt={horse.name}
                        fill
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "#999", fontSize: "32px", background: "#f5f5f5"
                    }}>🐴</div>
                )}

                {horse.is_for_sale && (
                    <div style={{
                        position: "absolute", top: "8px", right: "8px",
                        background: "var(--color-accent)", color: "#ffffff",
                        fontSize: "10px", fontWeight: 700, padding: "3px 8px",
                    }}>
                        FOR SALE
                    </div>
                )}
                <div style={{ position: "absolute", top: "8px", left: "8px" }}>
                    <FollowButton horseId={horse.id} />
                </div>
            </div>

            {/* Content */}
            <div className="features-content" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff", flex: 1 }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-header)", margin: "0 0 8px" }}>
                    {horse.name}
                </h3>
                {headline && (
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>
                        {headline}
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {horse.breeder && (
                        <div style={{ fontSize: "14px", color: "#666" }}>
                            Breeder: <span style={{ color: "#333", fontWeight: "600" }}>{horse.breeder}</span>
                        </div>
                    )}
                    {horse.trainer && (
                        <div style={{ fontSize: "14px", color: "var(--color-primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                            Trainer: {horse.trainer.name} <ChevronRight size={14} strokeWidth={3} />
                        </div>
                    )}
                    {horse.is_for_sale && horse.sale_price && (
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--color-text-header)", marginTop: "10px" }}>
                            ${horse.sale_price.toLocaleString()}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
