"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, X } from "lucide-react";

interface RoleFormProps {
    role?: { id: number; name: string; description: string | null };
    allPermissions: { id: number; name: string }[];
    selectedPermissionIds?: number[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function RoleForm({ role, allPermissions, selectedPermissionIds = [], onSuccess, onCancel }: RoleFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!role;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: role?.name || "",
        description: role?.description || "",
    });

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(selectedPermissionIds);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let roleId = role?.id;
            
            // 1. Save or Update Role
            if (isEdit) {
                const { error: updateError } = await (supabase.from("roles") as any).update(formData).eq("id", roleId);
                if (updateError) throw updateError;
            } else {
                const { data, error: insertError } = await (supabase.from("roles") as any).insert([formData]).select();
                if (insertError) throw insertError;
                roleId = data[0].id;
            }

            // 2. Update Role-Permission relationship
            // Simplest way: Delete all and re-insert
            const { error: deleteError } = await (supabase.from("role_permissions") as any).delete().eq("role_id", roleId);
            if (deleteError) throw deleteError;

            if (selectedPermissions.length > 0) {
                const relations = selectedPermissions.map(pId => ({
                    role_id: roleId,
                    permission_id: pId
                }));
                const { error: relError } = await (supabase.from("role_permissions") as any).insert(relations);
                if (relError) throw relError;
            }

            if (onSuccess) {
                onSuccess();
            } else {
                // For new creation, reset or refresh
                if (!isEdit) {
                    setFormData({ name: "", description: "" });
                    setSelectedPermissions([]);
                }
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
                {isEdit ? "Edit Role" : "Add New Custom Role"}
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
                        Role Name *
                    </label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Sales Executive"
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
                        placeholder="Role purpose and responsibility"
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

                <div style={{ marginBottom: "24px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "10px", fontSize: "13px", color: "var(--color-text-dim)" }}>
                        Permissions
                    </label>
                    <div style={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        gap: "8px", 
                        padding: "12px", 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid var(--color-border)", 
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto"
                    }}>
                        {allPermissions.length > 0 ? (
                            allPermissions.map((permission) => {
                                const isSelected = selectedPermissions.includes(permission.id);
                                return (
                                    <button
                                        key={permission.id}
                                        type="button"
                                        onClick={() => togglePermission(permission.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "6px 12px",
                                            fontSize: "12px",
                                            background: isSelected ? "var(--color-primary)" : "var(--color-bg-dark)",
                                            color: isSelected ? "var(--color-bg-dark)" : "var(--color-text-dim)",
                                            border: "1px solid",
                                            borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                                            borderRadius: "20px",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            fontWeight: isSelected ? 600 : 400
                                        }}
                                    >
                                        {isSelected && <Check size={12} />}
                                        {permission.name}
                                    </button>
                                );
                            })
                        ) : (
                            <p style={{ fontSize: "12px", color: "var(--color-text-dim)", margin: 0 }}>
                                No permissions found. Create them first.
                            </p>
                        )}
                    </div>
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
                        {loading ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
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
