import HorseForm from "@/components/admin/HorseForm";
import Link from "next/link";

export default function NewHorsePage() {
    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/horses" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Horses
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Add New Horse</h1>
            </div>
            <HorseForm />
        </div>
    );
}
