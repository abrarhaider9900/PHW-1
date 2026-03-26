import HorseForm from "@/components/admin/HorseForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditHorsePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditHorsePage({ params }: EditHorsePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: horse } = await supabase
        .from("horses")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (!horse) notFound();

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/horses" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Horses
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Edit Horse: {(horse as any).name}</h1>
            </div>
            <HorseForm horse={horse as any} />
        </div>
    );
}
