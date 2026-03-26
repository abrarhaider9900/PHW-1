"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Discipline } from "@/types/database";

interface DisciplineFormProps {
    discipline?: Discipline;
}

export default function DisciplineForm({ discipline }: DisciplineFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!discipline;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: discipline?.name || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let res;
        if (isEdit) {
            res = await (supabase.from("disciplines") as any).update(formData).eq("id", discipline!.id);
        } else {
            res = await (supabase.from("disciplines") as any).insert([formData]);
        }

        if (res.error) {
            setError(res.error.message);
            setLoading(false);
        } else {
            router.push("/admin/disciplines");
            router.refresh();
        }
    };

    return (
        <div className="card" style={{ padding: "24px", maxWidth: "500px" }}>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", padding: "12px", borderRadius: "4px", marginBottom: "20px", fontSize: "13px" }}>{error}</div>}

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label">Discipline Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="form-input" required placeholder="e.g. Barrel Racing" />
                </div>

                <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "12px" }}>
                        {loading ? "Saving..." : isEdit ? "Update Discipline" : "Create Discipline"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-outline" style={{ flex: 1, padding: "12px" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
