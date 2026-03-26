"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
    initialSettings: any;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(initialSettings);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const updates = Object.entries(settings).map(([key, value]) => ({
            key,
            value,
            updated_at: new Date().toISOString(),
        }));

        const { error } = await (supabase.from("site_settings") as any).upsert(updates);

        if (error) {
            alert("Error saving settings: " + error.message);
        } else {
            alert("Settings saved successfully!");
            router.refresh();
        }
        setLoading(false);
    };

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSocialChange = (network: string, value: string) => {
        setSettings((prev: any) => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [network]: value,
            },
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: "32px" }}>
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={settings.site_name || ""}
                        onChange={(e) => handleChange("site_name", e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                        type="email"
                        className="form-input"
                        value={settings.contact_email || ""}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                        type="text"
                        className="form-input"
                        value={settings.contact_phone || ""}
                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                    />
                </div>
            </div>

            <div style={{ marginTop: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>Social Support</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Facebook URL</label>
                        <input
                            type="url"
                            className="form-input"
                            value={settings.social_links?.facebook || ""}
                            onChange={(e) => handleSocialChange("facebook", e.target.value)}
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Instagram URL</label>
                        <input
                            type="url"
                            className="form-input"
                            value={settings.social_links?.instagram || ""}
                            onChange={(e) => handleSocialChange("instagram", e.target.value)}
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">YouTube URL</label>
                        <input
                            type="url"
                            className="form-input"
                            value={settings.social_links?.youtube || ""}
                            onChange={(e) => handleSocialChange("youtube", e.target.value)}
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "32px" }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </form>
    );
}
