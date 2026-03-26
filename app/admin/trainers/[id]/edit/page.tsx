import TrainerForm from "@/components/admin/TrainerForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditTrainerPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTrainerPage({ params }: EditTrainerPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: trainer } = await supabase
        .from("trainers")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (!trainer) notFound();

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/trainers" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Trainers
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Edit Trainer: {(trainer as any).name}</h1>
            </div>
            <TrainerForm trainer={trainer as any} />
        </div>
    );
}
