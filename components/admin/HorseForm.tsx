"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Horse, Profile, Trainer } from "@/types/database";

interface HorseFormProps {
    horse?: Horse;
}

export default function HorseForm({ horse }: HorseFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!horse;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: horse?.name || "",
        breed: horse?.breed || "",
        color: horse?.color || "",
        sex: horse?.sex || "Stallion",
        birth_year: horse?.birth_year || new Date().getFullYear(),
        registry: horse?.registry || "",
        sire: horse?.sire || "",
        dam: horse?.dam || "",
        owner_id: horse?.owner_id || "",
        trainer_id: horse?.trainer_id || "",
        is_for_sale: horse?.is_for_sale || false,
        sale_price: horse?.sale_price || "",
        image_url: horse?.image_url || "",
    });

    useEffect(() => {
        // Fetch owners and trainers for selects
        const fetchData = async () => {
            const [profilesRes, trainersRes] = await Promise.all([
                supabase.from("profiles").select("*").order("full_name"),
                supabase.from("trainers").select("*").order("name"),
            ]);
            if (profilesRes.data) setProfiles(profilesRes.data);
            if (trainersRes.data) setTrainers(trainersRes.data);
        };
        fetchData();
    }, [supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const dataToSave = {
            ...formData,
            birth_year: parseInt(formData.birth_year.toString()),
            sale_price: formData.sale_price ? parseFloat(formData.sale_price.toString()) : null,
            owner_id: formData.owner_id || null,
            trainer_id: formData.trainer_id ? parseInt(formData.trainer_id.toString()) : null,
            updated_at: new Date().toISOString(),
        };

        let res;
        if (isEdit) {
            res = await (supabase.from("horses") as any).update(dataToSave).eq("id", horse!.id);
        } else {
            res = await (supabase.from("horses") as any).insert([dataToSave]);
        }

        if (res.error) {
            setError(res.error.message);
            setLoading(false);
        } else {
            router.push("/admin/horses");
            router.refresh();
        }
    };

    return (
        <div className="card" style={{ padding: "24px", maxWidth: "800px" }}>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{
                        background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                        color: "#f87171", padding: "12px", borderRadius: "4px", marginBottom: "20px", fontSize: "13px"
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                        <label className="form-label">Horse Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                    </div>
                    <div>
                        <label className="form-label">Birth Year</label>
                        <input type="number" name="birth_year" value={formData.birth_year} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Breed</label>
                        <input name="breed" value={formData.breed} onChange={handleChange} className="form-input" placeholder="e.g. Quarter Horse" />
                    </div>
                    <div>
                        <label className="form-label">Color</label>
                        <input name="color" value={formData.color} onChange={handleChange} className="form-input" placeholder="e.g. Bay" />
                    </div>
                    <div>
                        <label className="form-label">Sex</label>
                        <select name="sex" value={formData.sex} onChange={handleChange} className="form-input">
                            <option value="Stallion">Stallion</option>
                            <option value="Mare">Mare</option>
                            <option value="Gelding">Gelding</option>
                            <option value="Colt">Colt</option>
                            <option value="Filly">Filly</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Registry</label>
                        <input name="registry" value={formData.registry} onChange={handleChange} className="form-input" placeholder="e.g. AQHA" />
                    </div>
                    <div>
                        <label className="form-label">Sire (Father)</label>
                        <input name="sire" value={formData.sire} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Dam (Mother)</label>
                        <input name="dam" value={formData.dam} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Owner</label>
                        <select name="owner_id" value={formData.owner_id} onChange={handleChange} className="form-input">
                            <option value="">Select Owner</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Trainer</label>
                        <select name="trainer_id" value={formData.trainer_id} onChange={handleChange} className="form-input">
                            <option value="">Select Trainer</option>
                            {trainers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ padding: "16px", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "12px" }}>
                        <input type="checkbox" name="is_for_sale" checked={formData.is_for_sale} onChange={handleChange} />
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Is For Sale?</span>
                    </label>
                    {formData.is_for_sale && (
                        <div>
                            <label className="form-label">Sale Price ($)</label>
                            <input type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} className="form-input" placeholder="0.00" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="form-label">Image URL</label>
                    <input name="image_url" value={formData.image_url} onChange={handleChange} className="form-input" placeholder="https://..." />
                </div>

                <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "12px" }}>
                        {loading ? "Saving..." : isEdit ? "Update Horse" : "Create Horse"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-outline" style={{ flex: 1, padding: "12px" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
