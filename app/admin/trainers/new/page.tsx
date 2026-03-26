import TrainerForm from "@/components/admin/TrainerForm";
import Link from "next/link";

export default function NewTrainerPage() {
    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/trainers" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Trainers
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Add New Trainer</h1>
            </div>
            <TrainerForm />
        </div>
    );
}
