import { createClient } from "@/lib/supabase/server";
import HorseCard from "@/components/horses/HorseCard";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import SponsorAd from "@/components/layout/SponsorAd";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Horses | Performance Horse World",
    description: "Browse all performance horses tracked on Performance Horse World.",
};

interface SearchParams {
    q?: string;
    discipline?: string;
    sex?: string;
    page?: string;
}

const PAGE_SIZE = 10;

export default async function AllHorsesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const supabase = await createClient();
    const page = parseInt(params.page ?? "1");
    const offset = (page - 1) * PAGE_SIZE;

    let query = (supabase
        .from("horses") as any)
        .select("*", { count: "exact" });

    if (params.q) {
        query = query.ilike("name", `%${params.q}%`);
    }
    if (params.sex) {
        query = query.eq("sex", params.sex);
    }

    const { data: horses, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

    const { data: sponsors } = await supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .eq("position", "sidebar")
        .limit(1);

    const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
    const sidebarSponsor = sponsors?.[0] ?? null;

    return (
        <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 15px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "30px" }}>

                    {/* Main Content */}
                    <div>
                        <div className="section-header">
                            <h4 style={{ fontSize: "21px", color: "#141414", textTransform: "uppercase" }}>All Horses</h4>
                        </div>

                        {/* Search/Filter Bar */}
                        {/* <div style={{ background: "#ffffff", border: "1px solid #e4e4e4", padding: "20px", marginBottom: "30px", borderRadius: "10px" }}>
                            <form style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                <input
                                    name="q"
                                    defaultValue={params.q}
                                    placeholder="Search horse name..."
                                    className="form-input"
                                    style={{ flex: "1 1 250px" }}
                                />
                                <select
                                    name="sex"
                                    defaultValue={params.sex}
                                    className="form-input"
                                    style={{ flex: "0 0 160px" }}
                                >
                                    <option value="">All Sexes</option>
                                    {["Stallion", "Mare", "Gelding", "Colt", "Filly"].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <button type="submit" className="btn-primary" style={{ padding: "10px 25px" }}>Search</button>
                                {(params.q || params.sex) && (
                                    <a href="/allhorses" className="btn-primary" style={{ background: "#666" }}>Clear</a>
                                )}
                            </form>
                        </div> */}

                        {/* Horse List */}
                        {horses && horses.length > 0 ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0" }}>
                                {horses.map((horse: any) => (
                                    <HorseCard key={horse.id} horse={horse} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: "60px 20px", textAlign: "center", color: "#999", background: "#fff", border: "1px solid #e4e4e4", borderRadius: "10px" }}>
                                No horses found matching your criteria.
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "30px" }}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <a
                                        key={p}
                                        href={`/allhorses?page=${p}${params.q ? `&q=${params.q}` : ""}${params.sex ? `&sex=${params.sex}` : ""}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "40px",
                                            height: "40px",
                                            background: p === page ? "#e49320" : "#fff",
                                            color: p === page ? "#fff" : "#141414",
                                            border: "1px solid #e4e4e4",
                                            fontWeight: "700",
                                            transition: "0.3s"
                                        }}
                                    >
                                        {p}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        <div className="card" style={{ padding: "0", border: "none" }}>
                            <div className="section-header" style={{ marginBottom: "15px" }}>
                                <h4 style={{ fontSize: "16px", textTransform: "uppercase" }}>Sponsor Ad</h4>
                            </div>
                            <SponsorAd sponsor={sidebarSponsor} width={340} height={250} />
                        </div>
                        <UpcomingEvents />
                    </aside>

                </div>
            </div>
        </div>
    );
}
