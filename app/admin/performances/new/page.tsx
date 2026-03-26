import PerformanceForm from "@/components/admin/PerformanceForm";
import Link from "next/link";

export default function NewPerformancePage() {
    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/performances" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Performances
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Add Performance Entry</h1>
            </div>
            <PerformanceForm />
        </div>
    );
}
