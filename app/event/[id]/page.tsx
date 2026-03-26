import { createClient } from "@/lib/supabase/server";
import SponsorAd from "@/components/layout/SponsorAd";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatLocation } from "@/utils/format";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: event } = await (supabase
        .from("events")
        .select("name, city, state")
        .eq("id", parseInt(id))
        .single() as any);
    if (!event) return { title: "Event Not Found" };
    return {
        title: `${event.name} | Performance Horse World`,
        description: `Performance horse event in ${[event.city, event.state].filter(Boolean).join(", ")}`,
    };
}

export default async function EventDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event } = await (supabase
        .from("events")
        .select("*")
        .eq("id", parseInt(id))
        .single() as any);

    if (!event) notFound();

    // Performances at this event
    const { data: performances } = await (supabase
        .from("performances")
        .select("*, horse:horses(id, name), discipline:disciplines(name)")
        .eq("event_id", event.id)
        .order("discipline_id")
        .order("placing") as any);

    const location = formatLocation(event.venue, event.city, event.state, event.country);

    return (
        <div className="container-phw" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

                {/* ── Main ── */}
                <div>
                    {/* Breadcrumb */}
                    <div style={{ fontSize: "12px", color: "var(--color-text-dim)", marginBottom: "12px" }}>
                        <Link href="/" style={{ color: "var(--color-text-dim)" }}>Home</Link>
                        {" / "}
                        <Link href="/allevents" style={{ color: "var(--color-text-dim)" }}>Events</Link>
                        {" / "}
                        <span style={{ color: "var(--color-text-muted)" }}>{event.name}</span>
                    </div>

                    {/* Event detail card */}
                    <div className="card" style={{ marginBottom: "16px" }}>
                        <div className="section-header">{event.name}</div>
                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "16px" }}>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--color-text-dim)", textTransform: "uppercase", marginBottom: "3px" }}>Date</div>
                                    <div style={{ fontSize: "14px", color: "var(--color-primary)", fontWeight: 600 }}>{formatDate(event.date)}</div>
                                </div>
                                {location && (
                                    <div>
                                        <div style={{ fontSize: "11px", color: "var(--color-text-dim)", textTransform: "uppercase", marginBottom: "3px" }}>Location</div>
                                        <div style={{ fontSize: "14px", color: "var(--color-text)" }}>{location}</div>
                                    </div>
                                )}
                            </div>
                            {event.description && (
                                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                                    {event.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Event results */}
                    {performances && performances.length > 0 && (
                        <div className="card">
                            <div className="section-header">Event Results</div>
                            <div>
                                <table className="phw-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Horse</th>
                                            <th>Discipline</th>
                                            <th>Score/Time</th>
                                            <th>Prize</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performances.map((perf: any) => (
                                            <tr key={perf.id}>
                                                <td style={{ color: "var(--color-text-dim)" }}>{perf.placing ?? "—"}</td>
                                                <td>
                                                    <Link href={`/Stallions/${perf.horse_id}`} style={{ color: "var(--color-primary)" }}>
                                                        {(perf.horse as any)?.name ?? "—"}
                                                    </Link>
                                                </td>
                                                <td style={{ color: "var(--color-text-muted)" }}>{(perf.discipline as any)?.name ?? "—"}</td>
                                                <td>{perf.time_or_score ?? "—"}</td>
                                                <td style={{ color: "var(--color-primary)" }}>
                                                    {perf.prize_money ? `$${perf.prize_money.toLocaleString()}` : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Sidebar ── */}
                <aside>
                    <div className="section-header" style={{ marginBottom: "8px" }}>SPONSOR AD</div>
                    <SponsorAd sponsor={null} width={280} height={220} />
                </aside>
            </div>
        </div>
    );
}
