import DisciplineForm from "@/components/admin/DisciplineForm";
import Link from "next/link";

export default function NewDisciplinePage() {
    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/disciplines" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Disciplines
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Add New Discipline</h1>
            </div>
            <DisciplineForm />
        </div>
    );
}
