import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/events/EventCard";
import SponsorAd from "@/components/layout/SponsorAd";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Events | Performance Horse World",
    description: "Browse all upcoming and past horse performance events.",
};

export default async function AllEventsPage() {
    const supabase = await createClient();

    const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

    const today = new Date().toISOString().split("T")[0];
    const upcoming = events?.filter((e: any) => e.date >= today) ?? [];
    const past = events?.filter((e: any) => e.date < today) ?? [];

    return (
        <div className="container-phw" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

                {/* ── Main ── */}
                <div>
                    <div className="section-header" style={{ marginBottom: "16px" }}>Event List</div>

                    {upcoming.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                                Upcoming Events
                            </div>
                            {upcoming.map((event: any) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}

                    {past.length > 0 && (
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                                Past Events
                            </div>
                            {past.map((event: any) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}

                    {(!events || events.length === 0) && (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)", fontSize: "14px" }}>
                            No events found
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
