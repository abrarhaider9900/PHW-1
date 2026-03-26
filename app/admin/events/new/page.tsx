import EventForm from "@/components/admin/EventForm";
import Link from "next/link";

export default function NewEventPage() {
    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/events" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Events
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Add New Event</h1>
            </div>
            <EventForm />
        </div>
    );
}
