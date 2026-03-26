"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/types/database";

interface EventFormProps {
    event?: Event;
}

export default function EventForm({ event }: EventFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!event;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: event?.name || "",
        date: event?.date || new Date().toISOString().split("T")[0],
        venue: event?.venue || "",
        city: event?.city || "",
        state: event?.state || "",
        country: event?.country || "USA",
        description: event?.description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let res;
        if (isEdit) {
            res = await (supabase.from("events") as any).update(formData).eq("id", event!.id);
        } else {
            res = await (supabase.from("events") as any).insert([formData]);
        }

        if (res.error) {
            setError(res.error.message);
            setLoading(false);
        } else {
            router.push("/admin/events");
            router.refresh();
        }
    };

    return (
        <div className="card" style={{ padding: "24px", maxWidth: "800px" }}>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", padding: "12px", borderRadius: "4px", marginBottom: "20px", fontSize: "13px" }}>{error}</div>}

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Event Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                        <label className="form-label">Date *</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required />
                    </div>
                    <div>
                        <label className="form-label">Venue</label>
                        <input name="venue" value={formData.venue} onChange={handleChange} className="form-input" placeholder="e.g. Will Rogers Memorial Center" />
                    </div>
                    <div>
                        <label className="form-label">City</label>
                        <input name="city" value={formData.city} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">State/Province</label>
                        <input name="state" value={formData.state} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Country</label>
                        <input name="country" value={formData.country} onChange={handleChange} className="form-input" />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" style={{ minHeight: "100px" }} />
                </div>

                <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "12px" }}>
                        {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-outline" style={{ flex: 1, padding: "12px" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
