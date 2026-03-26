import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminTrainersPage() {
    const supabase = await createClient();

    const { data: trainers } = await supabase
        .from("trainers")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Trainers</h1>
                <Link href="/admin/trainers/new" className="btn-primary">
                    + Add New Trainer
                </Link>
            </div>

            <div className="card">
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Specialty</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainers && trainers.length > 0 ? (
                            trainers.map((trainer: any) => (
                                <tr key={trainer.id}>
                                    <td style={{ fontWeight: 600, color: "#fff" }}>{trainer.name}</td>
                                    <td>{trainer.location || "—"}</td>
                                    <td>
                                        {trainer.specialties ? (
                                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                {trainer.specialties.map((s: string) => (
                                                    <span key={s} className="badge badge-gray">{s}</span>
                                                ))}
                                            </div>
                                        ) : "—"}
                                    </td>
                                    <td style={{ fontSize: "12px", color: "var(--color-text-dim)" }}>{trainer.phone || "—"}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <Link href={`/admin/trainers/${trainer.id}/edit`} style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                                                Edit
                                            </Link>
                                            <DeleteButton id={trainer.id} table="trainers" confirmMessage={`Are you sure you want to delete trainer ${trainer.name}?`} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No trainers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
