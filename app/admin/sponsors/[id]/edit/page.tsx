import SponsorForm from "@/components/admin/SponsorForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditSponsorPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditSponsorPage({ params }: EditSponsorPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: sponsor } = await supabase
        .from("sponsors")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (!sponsor) notFound();

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/sponsors" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Sponsors
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Edit Sponsor: {(sponsor as any).name}</h1>
            </div>
            <SponsorForm sponsor={sponsor as any} />
        </div>
    );
}
