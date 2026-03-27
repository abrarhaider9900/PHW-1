"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PermissionFormProps {
    permission?: { id: number; name: string; description: string | null };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PermissionForm({ permission, onSuccess, onCancel }: PermissionFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!permission;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: permission?.name || "",
        description: permission?.description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let res;
            if (isEdit) {
                res = await (supabase.from("permissions") as any).update(formData).eq("id", permission!.id);
            } else {
                res = await (supabase.from("permissions") as any).insert([formData]);
            }

            if (res.error) throw res.error;

            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>
                {isEdit ? "Edit Permission" : "Add New Permission"}
            </h3>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{ 
                        background: "rgba(220,38,38,0.1)", 
                        border: "1px solid rgba(220,38,38,0.3)", 
                        color: "#f87171", 
                        padding: "10px", 
                        borderRadius: "4px", 
                        marginBottom: "16px", 
                        fontSize: "13px" 
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "var(--color-text-dim)" }}>
                        Permission Name *
                    </label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. create_horse"
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: "var(--color-bg-dark)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "4px",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "var(--color-text-dim)" }}>
                        Description
                    </label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        placeholder="Briefly describe what this permission allows"
                        rows={3}
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: "var(--color-bg-dark)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "4px",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                            resize: "vertical"
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            flex: 1, 
                            padding: "10px", 
                            background: "var(--color-primary)", 
                            color: "var(--color-bg-dark)",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: 600,
                            cursor: loading ? "default" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                    </button>
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel}
                            style={{ 
                                flex: 1, 
                                padding: "10px", 
                                background: "transparent", 
                                color: "var(--color-text-dim)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "4px",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
