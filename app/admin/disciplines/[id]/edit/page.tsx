import DisciplineForm from "@/components/admin/DisciplineForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditDisciplinePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditDisciplinePage({ params }: EditDisciplinePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: discipline } = await supabase
        .from("disciplines")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (!discipline) notFound();

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/disciplines" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Disciplines
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Edit Discipline: {(discipline as any).name}</h1>
            </div>
            <DisciplineForm discipline={discipline as any} />
        </div>
    );
}
