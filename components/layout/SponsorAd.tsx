import type { Sponsor } from "@/types/database";
import Link from "next/link";
import Image from "next/image";

interface SponsorAdProps {
    sponsor?: Sponsor | null;
    label?: string;
    width?: number;
    height?: number;
}

export default function SponsorAd({
    sponsor,
    label = "SPONSOR AD",
    width = 300,
    height = 250,
}: SponsorAdProps) {
    const content = (
        <div
            className="sponsor-ad"
            style={{
                width: "100%",
                maxWidth: `${width}px`,
                height: `${height}px`,
                position: "relative",
            }}
        >
            {sponsor?.image_url ? (
                <Image
                    src={sponsor.image_url}
                    alt={sponsor.name}
                    fill
                    style={{ objectFit: "cover" }}
                />
            ) : (
                <div style={{ textAlign: "center", padding: "16px" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-dim)", marginBottom: "4px" }}>
                        {label}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-dim)" }}>
                        {width} x {height}
                    </div>
                </div>
            )}
        </div>
    );

    if (sponsor?.link_url) {
        return (
            <Link href={sponsor.link_url} target="_blank" rel="noopener noreferrer">
                {content}
            </Link>
        );
    }

    return content;
}
