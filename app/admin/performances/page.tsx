import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatMoney } from "@/utils/format";

export default async function AdminPerformancesPage() {
    const supabase = await createClient();

    const { data: performances } = await supabase
        .from("performances")
        .select("*, horse:horses(name), event:events(name), discipline:disciplines(name)")
        .order("created_at", { ascending: false });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Performances</h1>
                <Link href="/admin/performances/new" className="btn-primary">
                    + Add Entry
                </Link>
            </div>

            <div className="card">
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>Horse</th>
                            <th>Event</th>
                            <th>Discipline</th>
                            <th>Score/Time</th>
                            <th>Placing</th>
                            <th>Prize</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performances && performances.length > 0 ? (
                            performances.map((perf: any) => (
                                <tr key={perf.id}>
                                    <td style={{ fontWeight: 600, color: "#fff" }}>{(perf.horse as any)?.name}</td>
                                    <td style={{ fontSize: "12px" }}>{(perf.event as any)?.name}</td>
                                    <td>
                                        <span className="badge badge-gray">{(perf.discipline as any)?.name}</span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{perf.time_or_score ?? "—"}</td>
                                    <td>{perf.placing ? `#${perf.placing}` : "—"}</td>
                                    <td style={{ color: "var(--color-primary)", fontWeight: 600 }}>{formatMoney(perf.prize_money)}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <Link href={`/admin/performances/${perf.id}/edit`} style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                                                Edit
                                            </Link>
                                            <DeleteButton id={perf.id} table="performances" confirmMessage="Are you sure you want to delete this performance entry?" />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No performance entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
