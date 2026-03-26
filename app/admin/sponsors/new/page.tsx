import SponsorForm from "@/components/admin/SponsorForm";
import Link from "next/link";

export default function NewSponsorPage() {
    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/admin/sponsors" style={{ color: "var(--color-text-dim)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to Sponsors
                </Link>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Add New Sponsor</h1>
            </div>
            <SponsorForm />
        </div>
    );
}
