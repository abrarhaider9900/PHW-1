"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push("/login"); return; }
            setUserId(user.id);
            supabase.from("profiles").select("full_name").eq("id", user.id).single()
                .then(({ data }) => {
                    const profile = data as any;
                    setFullName(profile?.full_name ?? "");
                    setLoading(false);
                });
        });
    }, [router, supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await (supabase
            .from("profiles") as any)
            .update({ full_name: fullName, updated_at: new Date().toISOString() })
            .eq("id", userId);
        setMessage(error ? error.message : "Profile updated successfully!");
        setSaving(false);
    };

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>;
    }

    return (
        <div className="container-phw" style={{ paddingTop: "24px", paddingBottom: "24px", maxWidth: "500px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>Edit Profile</h1>
            <div className="card" style={{ padding: "24px" }}>
                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {message && (
                        <div style={{
                            background: message.includes("success") ? "rgba(34,197,94,0.1)" : "rgba(220,38,38,0.1)",
                            border: `1px solid ${message.includes("success") ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)"}`,
                            color: message.includes("success") ? "#4ade80" : "#f87171",
                            padding: "10px 14px", borderRadius: "3px", fontSize: "13px",
                        }}>{message}</div>
                    )}
                    <div>
                        <label className="form-label">Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                            className="form-input" required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={saving}
                        style={{ padding: "10px", opacity: saving ? 0.7 : 1 }}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}
