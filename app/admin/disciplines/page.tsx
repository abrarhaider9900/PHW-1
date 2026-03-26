import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminDisciplinesPage() {
    const supabase = await createClient();

    const { data: disciplines } = await supabase
        .from("disciplines")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Disciplines</h1>
                <Link href="/admin/disciplines/new" className="btn-primary">
                    + Add Discipline
                </Link>
            </div>

            <div className="card" style={{ maxWidth: "600px" }}>
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Discipline Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disciplines && disciplines.length > 0 ? (
                            disciplines.map((d: any) => (
                                <tr key={d.id}>
                                    <td style={{ color: "var(--color-text-dim)" }}>{d.id}</td>
                                    <td style={{ fontWeight: 600, color: "#fff" }}>{d.name}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <Link href={`/admin/disciplines/${d.id}/edit`} style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                                                Edit
                                            </Link>
                                            <DeleteButton id={d.id} table="disciplines" confirmMessage={`Are you sure you want to delete ${d.name}?`} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No disciplines found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
