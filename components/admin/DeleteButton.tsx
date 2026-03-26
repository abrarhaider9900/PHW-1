"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
    id: string | number;
    table: string;
    label?: string;
    confirmMessage?: string;
}

export default function DeleteButton({
    id,
    table,
    label = "Delete",
    confirmMessage = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(confirmMessage)) return;

        setLoading(true);
        const { error } = await supabase.from(table).delete().eq("id", id);

        if (error) {
            alert("Error deleting item: " + error.message);
            setLoading(false);
        } else {
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleDelete}
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
            {loading ? "Deleting..." : label}
        </button>
    );
}
