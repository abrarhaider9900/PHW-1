import UpcomingEvents from "@/components/events/UpcomingEvents";
import SponsorAd from "@/components/layout/SponsorAd";
import FollowButton from "@/components/horses/FollowButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { horseHeadline } from "@/utils/format";
import { getEmbedUrl } from "@/utils/video";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Horse } from "@/types/database";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("horses")
        .select("name, breed, color")
        .eq("id", parseInt(id))
        .single();

    const horse = data as any;

    if (!horse) return { title: "Horse Not Found" };
    return {
        title: `${horse.name} | Performance Horse World`,
        description: `${horse.color ?? ""} ${horse.breed ?? ""} performance horse profile`,
    };
}

export default async function HorseDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: horseData } = await supabase
        .from("horses")
        .select("*, trainer:trainers(*), owner:profiles(*)")
        .eq("id", parseInt(id))
        .single();

    const horse = horseData as Horse | null;

    if (!horse) notFound();

    // Latest performance with video
    const { data: latestPerfData } = await supabase
        .from("performances")
        .select("*, event:events(*), discipline:disciplines(*)")
        .eq("horse_id", horse.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const latestPerf = latestPerfData as any | null;

    // All performances
    const { data: performancesData } = await supabase
        .from("performances")
        .select("*, event:events(*), discipline:disciplines(*)")
        .eq("horse_id", horse.id)
        .order("created_at", { ascending: false })
        .limit(10);

    const performances = performancesData as any[] | null;

    const headline = horseHeadline(horse.color, horse.sex, horse.birth_year, horse.registry);

    return (
        <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 15px" }}>

                {/* Breadcrumb */}
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "25px" }}>
                    <Link href="/" style={{ color: "#666" }}>Home</Link>
                    {" / "}
                    <Link href="/allhorses" style={{ color: "#666" }}>Horses</Link>
                    {" / "}
                    <span style={{ color: "#141414", fontWeight: "600" }}>{horse.name}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "30px" }}>

                    {/* Left Column */}
                    <div>
                        {/* Horse Detail Header */}
                        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h4 style={{ fontSize: "24px", color: "#141414", textTransform: "uppercase" }}>{horse.name}</h4>
                            <FollowButton horseId={horse.id} />
                        </div>

                        {/* Summary Info */}
                        <div style={{ background: "#ffffff", border: "1px solid #e4e4e4", padding: "30px", marginBottom: "30px", borderRadius: "10px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <tbody>
                                        {headline && (
                                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#666" }}>General Info</td>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#141414", fontWeight: "700", textAlign: "right" }}>{headline}</td>
                                            </tr>
                                        )}
                                        {horse.owner && (
                                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#666" }}>Owner</td>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#141414", fontWeight: "700", textAlign: "right" }}>{(horse.owner as any).full_name}</td>
                                            </tr>
                                        )}
                                        {horse.trainer && (
                                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#666" }}>Trainer</td>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#e49320", fontWeight: "700", textAlign: "right" }}>{(horse.trainer as any).name}</td>
                                            </tr>
                                        )}
                                        {horse.is_for_sale && horse.sale_price && (
                                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                <td style={{ padding: "12px 0", fontSize: "14px", color: "#666" }}>Price</td>
                                                <td style={{ padding: "12px 0", fontSize: "16px", color: "#141414", fontWeight: "800", textAlign: "right" }}>${horse.sale_price.toLocaleString()}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div>
                                    <h5 style={{ fontSize: "14px", color: "#666", marginBottom: "15px", textTransform: "uppercase" }}>Pedigree</h5>
                                    <div style={{ fontSize: "15px", color: "#141414", fontWeight: "600", padding: "15px", background: "#f9f9f9", borderLeft: "4px solid #e49320" }}>
                                        {[horse.sire, horse.dam].filter(Boolean).join(" × ") || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Video */}
                        <div style={{ marginBottom: "40px" }}>
                            <div className="section-header">
                                <h4 style={{ fontSize: "21px", color: "#141414", textTransform: "uppercase" }}>Latest Performance Video</h4>
                            </div>
                            <div style={{ background: "#ffffff", border: "1px solid #e4e4e4", padding: "15px", borderRadius: "10px" }}>
                                {latestPerf?.video_url ? (
                                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "5px" }}>
                                        <iframe
                                            src={getEmbedUrl(latestPerf.video_url)}
                                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#999" }}>
                                        No video available for the latest performance.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div>
                            <div className="section-header">
                                <h4 style={{ fontSize: "21px", color: "#141414", textTransform: "uppercase" }}>Performance Stats</h4>
                            </div>
                            <div style={{ background: "#ffffff", border: "1px solid #e4e4e4", borderRadius: "10px", overflow: "hidden" }}>
                                {performances && performances.length > 0 ? (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e4e4e4" }}>
                                                <th style={{ padding: "15px", textAlign: "left", fontSize: "13px", color: "#666", textTransform: "uppercase" }}>Event</th>
                                                <th style={{ padding: "15px", textAlign: "left", fontSize: "13px", color: "#666", textTransform: "uppercase" }}>Discipline</th>
                                                <th style={{ padding: "15px", textAlign: "left", fontSize: "13px", color: "#666", textTransform: "uppercase" }}>Score/Time</th>
                                                <th style={{ padding: "15px", textAlign: "left", fontSize: "13px", color: "#666", textTransform: "uppercase" }}>Prize</th>
                                                <th style={{ padding: "15px", textAlign: "left", fontSize: "13px", color: "#666", textTransform: "uppercase" }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {performances.map((perf) => (
                                                <tr key={perf.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                    <td style={{ padding: "15px", fontSize: "14px" }}>
                                                        <Link href={`/event/${perf.event_id}`} style={{ color: "#e49320", fontWeight: "700" }}>
                                                            {(perf.event as any)?.name ?? "—"}
                                                        </Link>
                                                    </td>
                                                    <td style={{ padding: "15px", fontSize: "14px", color: "#666" }}>{(perf.discipline as any)?.name ?? "—"}</td>
                                                    <td style={{ padding: "15px", fontSize: "14px", color: "#141414", fontWeight: "600" }}>{perf.time_or_score ?? "—"}</td>
                                                    <td style={{ padding: "15px", fontSize: "14px", color: "#141414", fontWeight: "700" }}>
                                                        {perf.prize_money ? `$${perf.prize_money.toLocaleString()}` : "—"}
                                                    </td>
                                                    <td style={{ padding: "15px", fontSize: "13px", color: "#999" }}>
                                                        {perf.created_at ? new Date(perf.created_at).toLocaleDateString() : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                                        No performance data recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        <div className="card" style={{ padding: "0", border: "none" }}>
                            <div className="section-header" style={{ marginBottom: "15px" }}>
                                <h4 style={{ fontSize: "16px", textTransform: "uppercase" }}>Sponsor Ad</h4>
                            </div>
                            <SponsorAd sponsor={null} width={340} height={250} />
                        </div>
                        <UpcomingEvents />
                    </aside>

                </div>
            </div>
        </div>
    );
}
