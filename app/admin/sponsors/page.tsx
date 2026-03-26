import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminSponsorsPage() {
    const supabase = await createClient();

    const { data: sponsors } = await supabase
        .from("sponsors")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Sponsors</h1>
                <Link href="/admin/sponsors/new" className="btn-primary">
                    + Add New Sponsor
                </Link>
            </div>

            <div className="card">
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>Sponsor Name</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th>URL</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sponsors && sponsors.length > 0 ? (
                            sponsors.map((sponsor: any) => (
                                <tr key={sponsor.id}>
                                    <td style={{ fontWeight: 600, color: "#fff" }}>{sponsor.name}</td>
                                    <td><span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-text-dim)" }}>{sponsor.position}</span></td>
                                    <td>
                                        {sponsor.is_active ? (
                                            <span className="badge badge-gold">Active</span>
                                        ) : (
                                            <span className="badge badge-gray">Inactive</span>
                                        )}
                                    </td>
                                    <td>
                                        {sponsor.link_url && (
                                            <a href={sponsor.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--color-primary)" }}>
                                                {new URL(sponsor.link_url).hostname}
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <Link href={`/admin/sponsors/${sponsor.id}/edit`} style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                                                Edit
                                            </Link>
                                            <DeleteButton id={sponsor.id} table="sponsors" confirmMessage={`Are you sure you want to delete ${sponsor.name}?`} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No sponsors found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
