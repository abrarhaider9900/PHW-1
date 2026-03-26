import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/types/database";
import { formatDate, formatLocation } from "@/utils/format";
import { MapPin, Calendar, ChevronRight } from "lucide-react";

interface EventCardProps {
    event: Event;
    compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
    const location = formatLocation(event.venue, event.city, event.state, event.country);
    const date = formatDate(event.date);

    if (compact) {
        return (
            <Link
                href={`/event/${event.id}`}
                style={{
                    display: "flex",
                    gap: "15px",
                    background: "#ffffff",
                    border: "1px solid #e4e4e4",
                    padding: "15px",
                    marginBottom: "15px",
                    textDecoration: "none",
                    transition: "0.3s",
                    borderRadius: "10px",
                    borderLeft: "5px solid var(--color-primary)"
                }}
                className="hover:shadow-md"
            >
                {event.image_url && (
                    <div style={{ width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                        <Image src={event.image_url} alt={event.name} fill style={{ objectFit: "cover" }} />
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-text-header)", marginBottom: "3px" }}>
                        {event.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--color-primary)", fontWeight: "700", marginBottom: "3px" }}>
                        <Calendar size={12} strokeWidth={3} /> {date}
                    </div>
                    {location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#666" }}>
                            <MapPin size={12} /> {location} <ChevronRight size={12} style={{ marginLeft: "auto" }} strokeWidth={3} color="var(--color-primary)" />
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/event/${event.id}`}
            style={{
                display: "flex",
                gap: "20px",
                background: "#ffffff",
                border: "1px solid #e4e4e4",
                padding: "20px",
                marginBottom: "20px",
                textDecoration: "none",
                transition: "0.3s",
                borderRadius: "10px"
            }}
            className="hover:shadow-lg"
        >
            {event.image_url && (
                <div style={{ width: "150px", height: "100px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                    <Image src={event.image_url} alt={event.name} fill style={{ objectFit: "cover" }} />
                </div>
            )}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-text-header)", marginBottom: "10px" }}>
                    {event.name}
                </div>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--color-primary)", fontWeight: "700" }}>
                        <Calendar size={14} strokeWidth={3} /> {date}
                    </span>
                    {location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#666" }}>
                            <MapPin size={14} /> {location}
                        </span>
                    )}
                </div>
                {event.description && (
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, margin: 0 }}>
                        {event.description}
                    </p>
                )}
            </div>
        </Link>
    );
}
