import { createClient } from "@/lib/supabase/server";
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

    // Performances at this event (for results and any derived metadata)
    const { data: performances } = await (supabase
        .from("performances")
        .select("*, horse:horses(id, name), discipline:disciplines(name)")
        .eq("event_id", event.id)
        .order("discipline_id")
        .order("placing") as any);

    const location = formatLocation(event.venue, event.city, event.state, event.country);
    const when = formatDate(event.date);

    const eventType =
        (performances || [])
            .map((p: any) => p?.event_type)
            .find((v: any) => typeof v === "string" && v.trim().length > 0) ??
        (event as any)?.event_type ??
        null;

    const contactName =
        (event as any)?.contact ??
        (event as any)?.contact_name ??
        (event as any)?.contactName ??
        null;
    const address =
        (event as any)?.address ??
        (event as any)?.street_address ??
        (event as any)?.streetAddress ??
        null;
    const email =
        (event as any)?.email ??
        (event as any)?.contact_email ??
        (event as any)?.contactEmail ??
        null;
    const phone =
        (event as any)?.phone ??
        (event as any)?.contact_phone ??
        (event as any)?.contactPhone ??
        null;

    return (
        <div
            style={{
                background: "var(--color-bg)",
                padding: "30px 0 50px",
            }}
        >
            <div className="container" style={{ padding: "0 20px" }}>
                <div
                    style={{
                        maxWidth: "980px",
                        margin: "0 auto",
                        background: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        border: "1px solid #e8e8e8",
                    }}
                >
                    <div style={{ padding: "22px 26px 10px" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#0b1638", marginBottom: "6px" }}>
                            {event.name}
                        </div>
                        {location && (
                            <div style={{ fontSize: "12px", color: "#666", fontWeight: 600 }}>
                                {location}
                            </div>
                        )}
                    </div>

                    <div style={{ height: "1px", background: "#e8e8e8" }} />

                    <div style={{ padding: "14px 26px 26px" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "160px 1fr",
                                columnGap: "26px",
                                rowGap: "10px",
                                alignItems: "start",
                            }}
                        >
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>When</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>{when || "—"}</div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>Event Type</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>{eventType || "—"}</div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>Description</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d", whiteSpace: "pre-wrap" }}>
                                {event.description || "—"}
                            </div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>Arena</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>
                                {(event.venue as string | null) || "—"}
                            </div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>Contact</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>{contactName || "—"}</div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>Address</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>
                                {address || [event.city, event.state, event.country].filter(Boolean).join(", ") || "—"}
                            </div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>Email</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>{email || "—"}</div>

                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f2b4d" }}>phone</div>
                            <div style={{ fontSize: "12px", color: "#1f2b4d" }}>{phone || "—"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
