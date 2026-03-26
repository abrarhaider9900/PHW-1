"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Sponsor } from "@/types/database";

interface SponsorFormProps {
    sponsor?: Sponsor;
}

export default function SponsorForm({ sponsor }: SponsorFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!sponsor;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: sponsor?.name || "",
        link_url: sponsor?.link_url || "",
        image_url: sponsor?.image_url || "",
        position: sponsor?.position || "sidebar",
        is_active: sponsor?.is_active ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let res;
        if (isEdit) {
            res = await (supabase.from("sponsors") as any).update(formData).eq("id", sponsor!.id);
        } else {
            res = await (supabase.from("sponsors") as any).insert([formData]);
        }

        if (res.error) {
            setError(res.error.message);
            setLoading(false);
        } else {
            router.push("/admin/sponsors");
            router.refresh();
        }
    };

    return (
        <div className="card" style={{ padding: "24px", maxWidth: "600px" }}>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", padding: "12px", borderRadius: "4px", marginBottom: "20px", fontSize: "13px" }}>{error}</div>}

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Sponsor Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Website URL</label>
                    <input name="link_url" value={formData.link_url} onChange={handleChange} className="form-input" placeholder="https://..." />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Ad Image URL</label>
                    <input name="image_url" value={formData.image_url} onChange={handleChange} className="form-input" placeholder="https://..." />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <div>
                        <label className="form-label">Position</label>
                        <select name="position" value={formData.position} onChange={handleChange} className="form-input">
                            <option value="top">Top Banner</option>
                            <option value="sidebar">Sidebar</option>
                            <option value="footer">Footer</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", paddingTop: "24px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Active</span>
                        </label>
                    </div>
                </div>

                <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "12px" }}>
                        {loading ? "Saving..." : isEdit ? "Update Sponsor" : "Create Sponsor"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-outline" style={{ flex: 1, padding: "12px" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
