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
        <div style={{ 
            background: "#ffffff", 
            borderRadius: "24px", 
            padding: "32px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}>
            <div style={{ marginBottom: "20px" }}>
                <h4 style={{ 
                    fontSize: "18px", 
                    fontWeight: "850", 
                    color: "#071437",
                    margin: 0
                }}>
                    Upcoming Events
                </h4>
            </div>

            {events && events.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {events.map((event: any) => (
                        <EventCard key={event.id} event={event} compact />
                    ))}
                </div>
            ) : (
                <div style={{ 
                    padding: "30px", 
                    textAlign: "center", 
                    color: "#999", 
                    background: "#f8fafb",
                    border: "1px dashed #e0e0e0", 
                    borderRadius: "16px" 
                }}>
                    No upcoming events available.
                </div>
            )}
        </div>
    );
}
