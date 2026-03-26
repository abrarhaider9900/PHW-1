import EventForm from "@/components/admin/EventForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditEventPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (!event) notFound();

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/events" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Events
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Edit Event: {(event as any).name}</h1>
            </div>
            <EventForm event={event as any} />
        </div>
    );
}
