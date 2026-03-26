import PerformanceForm from "@/components/admin/PerformanceForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditPerformancePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPerformancePage({ params }: EditPerformancePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: performance } = await supabase
        .from("performances")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (!performance) notFound();

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/performances" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Performances
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Edit Performance Entry</h1>
            </div>
            <PerformanceForm performance={performance as any} />
        </div>
    );
}
