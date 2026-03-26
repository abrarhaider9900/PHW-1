import { createClient } from "@/lib/supabase/server";
import { getEmbedUrl } from "@/utils/video";
import Link from "next/link";
import type { Performance } from "@/types/database";

export default async function AdminVideosPage() {
    const supabase = await createClient();

    const { data: performancesData } = await supabase
        .from("performances")
        .select("*, horse:horses(name), event:events(name)")
        .not("video_url", "is", null)
        .order("created_at", { ascending: false });

    const performances = performancesData as any[] | null;

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Video Management</h1>
                <p style={{ color: "var(--color-text-dim)", fontSize: "14px" }}>
                    Oversee all horse performance videos across the site.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
                {performances && performances.length > 0 ? (
                    performances.map((perf) => (
                        <div key={perf.id} className="card" style={{ overflow: "hidden" }}>
                            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                                <iframe
                                    src={getEmbedUrl(perf.video_url)}
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                    allowFullScreen
                                />
                            </div>
                            <div style={{ padding: "16px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                                    {(perf.horse as any)?.name}
                                </h3>
                                <p style={{ fontSize: "13px", color: "var(--color-text-dim)", marginBottom: "12px" }}>
                                    {(perf.event as any)?.name} — {new Date(perf.created_at).toLocaleDateString()}
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Link
                                        href={`/admin/performances/${perf.id}/edit`}
                                        style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: 500 }}
                                    >
                                        Edit Entry
                                    </Link>
                                    <span style={{ fontSize: "11px", color: "var(--color-text-dim)" }}>
                                        ID: {perf.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card" style={{ gridColumn: "1 / -1", padding: "60px", textAlign: "center", color: "var(--color-text-dim)" }}>
                        No videos found in any performance entries.
                    </div>
                )}
            </div>
        </div>
    );
}
