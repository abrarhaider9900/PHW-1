"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Trainer } from "@/types/database";

interface TrainerFormProps {
    trainer?: Trainer;
}

export default function TrainerForm({ trainer }: TrainerFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!trainer;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: trainer?.name || "",
        location: trainer?.location || "",
        phone: trainer?.phone || "",
        email: trainer?.email || "",
        bio: trainer?.bio || "",
        image_url: trainer?.image_url || "",
        specialties: trainer?.specialties || [],
        is_spotlight: (trainer as any)?.is_spotlight ?? false,
    });

    const [newSpecialty, setNewSpecialty] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addSpecialty = () => {
        if (newSpecialty.trim()) {
            setFormData((prev) => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }));
            setNewSpecialty("");
        }
    };

    const removeSpecialty = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            specialties: prev.specialties.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let res;
        if (isEdit) {
            res = await (supabase.from("trainers") as any).update(formData as any).eq("id", trainer!.id);
        } else {
            res = await (supabase.from("trainers") as any).insert([formData as any]);
        }

        if (res.error) {
            setError(res.error.message);
            setLoading(false);
        } else {
            router.push("/admin/trainers");
            router.refresh();
        }
    };

    return (
        <div className="card" style={{ padding: "24px", maxWidth: "800px" }}>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", padding: "12px", borderRadius: "4px", marginBottom: "20px", fontSize: "13px" }}>{error}</div>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                        <label className="form-label">Trainer Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                    </div>
                    <div>
                        <label className="form-label">Location</label>
                        <input name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="e.g. Fort Worth, TX" />
                    </div>
                    <div>
                        <label className="form-label">Phone</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Specialties</label>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <input
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            className="form-input"
                            placeholder="e.g. Reining"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                        />
                        <button type="button" onClick={addSpecialty} className="btn-outline">Add</button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {formData.specialties.map((s, i) => (
                            <span key={i} className="badge badge-gray" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {s} <button type="button" onClick={() => removeSpecialty(i)} style={{ border: "none", background: "none", color: "#f87171", padding: 0, cursor: "pointer", fontSize: "14px" }}>×</button>
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Bio / Description</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} className="form-input" style={{ minHeight: "120px" }} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Image URL</label>
                    <input name="image_url" value={formData.image_url} onChange={handleChange} className="form-input" placeholder="https://..." />
                </div>

                <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(255,165,0,0.08)", borderRadius: "8px", border: "1px solid rgba(255,165,0,0.2)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={formData.is_spotlight}
                            onChange={(e) => setFormData((prev) => ({ ...prev, is_spotlight: e.target.checked }))}
                            style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)", cursor: "pointer" }}
                        />
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                            ⭐ Feature in Trainer Spotlight
                        </span>
                    </label>
                    <p style={{ margin: "8px 0 0 30px", fontSize: "12px", color: "var(--color-text-dim)" }}>
                        When checked, this trainer will appear in the Trainer Spotlight section on the home page.
                    </p>
                </div>

                <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "12px" }}>
                        {loading ? "Saving..." : isEdit ? "Update Trainer" : "Create Trainer"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-outline" style={{ flex: 1, padding: "12px" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
