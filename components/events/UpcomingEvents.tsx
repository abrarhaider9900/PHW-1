import { createClient } from "@/lib/supabase/server";
import EventCard from "./EventCard";

export default async function UpcomingEvents() {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: events } = await (supabase
        .from("events")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(5) as any);

    return (
        <div style={{ marginBottom: "30px" }}>
            <div className="section-header">
                <h4>Upcoming Events</h4>
            </div>

            {events && events.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {events.map((event: any) => (
                        <EventCard key={event.id} event={event} compact />
                    ))}
                </div>
            ) : (
                <div style={{ padding: "30px", textAlign: "center", color: "#999", border: "1px dashed #ccc", borderRadius: "10px" }}>
                    No upcoming events
                </div>
            )}
        </div>
    );
}
