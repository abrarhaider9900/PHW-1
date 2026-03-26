import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { horseHeadline } from "@/utils/format";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminHorsesPage() {
    const supabase = await createClient();

    const { data: horses } = await supabase
        .from("horses")
        .select("*, owner:profiles(full_name), trainer:trainers(name)")
        .order("name", { ascending: true });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Horses</h1>
                <Link href="/admin/horses/new" className="btn-primary">
                    + Add New Horse
                </Link>
            </div>

            <div className="card">
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Breed/Sex</th>
                            <th>Owner</th>
                            <th>Trainer</th>
                            <th>Sale Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horses && horses.length > 0 ? (
                            horses.map((horse: any) => (
                                <tr key={horse.id}>
                                    <td style={{ color: "var(--color-text-dim)", fontSize: "11px" }}>#{horse.id}</td>
                                    <td style={{ fontWeight: 600, color: "#fff" }}>{horse.name}</td>
                                    <td>
                                        <span style={{ fontSize: "12px" }}>
                                            {horseHeadline(horse.color, horse.sex, horse.birth_year, null)}
                                        </span>
                                    </td>
                                    <td>{horse.owner?.full_name || "—"}</td>
                                    <td>{horse.trainer?.name || "—"}</td>
                                    <td>
                                        {horse.is_for_sale ? (
                                            <span className="badge badge-gold">For Sale</span>
                                        ) : (
                                            <span className="badge badge-gray">Not for Sale</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            <Link href={`/admin/horses/${horse.id}/edit`} style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                                                Edit
                                            </Link>
                                            <DeleteButton id={horse.id} table="horses" confirmMessage={`Are you sure you want to delete ${horse.name}?`} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No horses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
