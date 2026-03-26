"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserRowProps {
    user: {
        id: string;
        full_name: string | null;
        role: string;
        status: string;
        created_at: string;
    };
}

export default function UserRow({ user }: UserRowProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleRoleToggle = async () => {
        const newRole = user.role === "admin" ? "user" : "admin";
        if (!confirm(`Are you sure you want to change ${user.full_name || 'this user'}'s role to ${newRole}?`)) return;

        setLoading(true);
        const { error } = await (supabase
            .from("profiles") as any)
            .update({ role: newRole })
            .eq("id", user.id);

        if (error) {
            alert("Error updating role: " + error.message);
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    const handleStatusToggle = async () => {
        const newStatus = user.status === "banned" ? "active" : "banned";
        const actionLabel = newStatus === "banned" ? "ban" : "unban";

        if (!confirm(`Are you sure you want to ${actionLabel} ${user.full_name || 'this user'}?`)) return;

        setLoading(true);
        const { error } = await (supabase
            .from("profiles") as any)
            .update({ status: newStatus })
            .eq("id", user.id);

        if (error) {
            alert(`Error trying to ${actionLabel} user: ` + error.message);
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <tr>
            <td style={{ fontSize: "10px", color: "var(--color-text-dim)" }}>{user.id.substring(0, 8)}...</td>
            <td style={{ fontWeight: 600, color: "#fff" }}>{user.full_name || "—"}</td>
            <td>
                <select
                    value={user.role}
                    onChange={async (e) => {
                        const newRole = e.target.value;
                        if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;
                        setLoading(true);
                        const { error } = await (supabase
                            .from("profiles") as any)
                            .update({ role: newRole })
                            .eq("id", user.id);
                        if (error) alert("Error updating role: " + error.message);
                        else router.refresh();
                        setLoading(false);
                    }}
                    disabled={loading}
                    className={`badge ${user.role === "admin" ? "badge-gold" : "badge-gray"}`}
                    style={{ background: "var(--color-bg-dark)", color: "#fff", border: "1px solid var(--color-border)", cursor: "pointer", outline: "none" }}
                >
                    <option value="user">User</option>
                    <option value="owner">Owner</option>
                    <option value="rider">Rider</option>
                    <option value="trainer">Trainer</option>
                    <option value="producer">Producer</option>
                    <option value="admin">Admin</option>
                </select>
            </td>
            <td>
                <span className={`badge ${user.status === "active" ? "badge-success" : user.status === "banned" ? "badge-danger" : "badge-gray"}`}>
                    {user.status}
                </span>
            </td>
            <td style={{ fontSize: "12px", color: "var(--color-text-dim)" }}>
                {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={handleStatusToggle}
                        disabled={loading}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "12px",
                            color: loading ? "var(--color-text-dim)" : "#f87171",
                            cursor: loading ? "default" : "pointer",
                            padding: 0,
                            fontWeight: 500,
                        }}
                    >
                        {user.status === "banned" ? "Unban" : "Ban"}
                    </button>
                </div>
            </td>
        </tr>
    );
}
