import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate, formatLocation } from "@/utils/format";

export default async function AdminEventsPage() {
    const supabase = await createClient();

    const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Events</h1>
                <Link href="/admin/events/new" className="btn-primary">
                    + Add New Event
                </Link>
            </div>

            <div className="card">
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Venue</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events && events.length > 0 ? (
                            events.map((event: any) => (
                                <tr key={event.id}>
                                    <td style={{ color: "var(--color-primary)", fontWeight: 600 }}>{formatDate(event.date)}</td>
                                    <td style={{ fontWeight: 600, color: "#fff" }}>{event.name}</td>
                                    <td>{event.venue || "—"}</td>
                                    <td style={{ fontSize: "12px" }}>
                                        {formatLocation(null, event.city, event.state, event.country)}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <Link href={`/admin/events/${event.id}/edit`} style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                                                Edit
                                            </Link>
                                            <DeleteButton id={event.id} table="events" confirmMessage={`Are you sure you want to delete ${event.name}?`} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No events found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
