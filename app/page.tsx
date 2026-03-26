import { createClient } from "@/lib/supabase/server";
import TopPerformances from "@/components/horses/TopPerformances";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import SponsorAd from "@/components/layout/SponsorAd";
import HeaderBanner from "@/components/layout/HeaderBanner";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Performance Horse World | Home",
    description: "Track top performing horses across barrel racing, tie-down roping, team roping, reining, and cutting.",
};

export default async function HomePage() {
    const supabase = await createClient();

    // Fetch disciplines
    const { data: disciplinesData } = await (supabase
        .from("disciplines")
        .select("*")
        .order("id") as any);
    const disciplines = disciplinesData as any[];

    // Fetch top performance per discipline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: performancesData } = await (supabase
        .from("performances")
        .select("*, horse:horses(*, trainer:trainers(*)), discipline:disciplines(*)")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("prize_money", { ascending: false }) as any);
    const performances = performancesData as any[];

    // Group by discipline
    const performancesByDiscipline: Record<string, any[]> = {};
    if (disciplines && performances) {
        for (const d of disciplines) {
            performancesByDiscipline[d.id] = performances.filter(
                (p: any) => p.discipline_id === d.id
            );
        }
    }

    // Trending horses
    const { data: trendingHorsesData } = await (supabase
        .from("horses")
        .select(`
            *,
            trainer:trainers(name),
            owner:profiles!horses_owner_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(3) as any);
    const trendingHorses = trendingHorsesData as any[];

    // Fetch Trainers for Spotlight (from both trainers table and spotlighted profiles)
    const [trainersRes, profilesRes] = await Promise.all([
        supabase.from("trainers").select("*, horses(count)").eq("is_spotlight", true).limit(3),
        supabase.from("profiles").select("*").eq("is_spotlight", true).contains("functional_roles", ["trainer"]).limit(3)
    ]);

    const spotlightTrainers = [
        ...((trainersRes.data as any[]) || []).map(t => ({ ...t, _source: 'trainers' })),
        ...((profilesRes.data as any[]) || []).map(p => ({ ...p, _source: 'profiles' }))
    ].slice(0, 3);

    const trainers = spotlightTrainers;

    // Active sponsors
    const { data: sponsorsData } = await (supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .eq("position", "sidebar")
        .limit(1) as any);
    const sponsors = sponsorsData as any[];

    const sidebarSponsor = sponsors?.[0] ?? null;

    return (
        <div style={{ background: "var(--color-bg)" }}>

            {/* Hero Banner Area */}
            <HeaderBanner />

            {/* Main Content Area */}
            <div className="container" style={{ padding: "0 15px 80px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px" }}>

                    {/* Left Column */}
                    <div>
                        {/* Top Performances Widget */}
                        <div className="features-style-area">
                            {disciplines && disciplines.length > 0 ? (
                                <TopPerformances
                                    disciplines={disciplines}
                                    performancesByDiscipline={performancesByDiscipline as any}
                                />
                            ) : (
                                <div style={{ marginBottom: "30px" }}>
                                    <div className="section-header">
                                        <h4>Top Performances — Month</h4>
                                    </div>
                                    <div style={{ padding: "40px", textAlign: "center", color: "#666", background: "#fff", border: "1px dashed #ccc", borderRadius: "10px" }}>
                                        No data available
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Trending Horses Section */}
                        <div style={{ marginTop: "60px" }}>
                            <div className="section-header">
                                <h4>Trending Horses</h4>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
                                {trendingHorses?.map((horse) => {
                                    // Calculate age precisely if birth_date is available
                                    let ageStr = "Unknown age";
                                    if (horse.birth_date) {
                                        const birth = new Date(horse.birth_date);
                                        const today = new Date();
                                        let age = today.getFullYear() - birth.getFullYear();
                                        const m = today.getMonth() - birth.getMonth();
                                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                                            age--;
                                        }
                                        ageStr = age >= 0 ? `${age} years` : "0 years";
                                    } else if (horse.birth_year) {
                                        const age = new Date().getFullYear() - horse.birth_year;
                                        ageStr = `${age} years`;
                                    }

                                    const ownerOrTrainerName = (horse.owner as any)?.full_name || horse.trainer?.name || "Unknown";

                                    return (
                                        <Link key={horse.id} href={`/Stallions/${horse.id}`} className="features-style-item" style={{
                                            textDecoration: "none",
                                            display: "flex",
                                            flexDirection: "column",
                                            marginBottom: 0,
                                            background: "#fff",
                                            borderRadius: "12px",
                                            border: "1px solid #e4e4e4",
                                            overflow: "hidden"
                                        }}>
                                            <div className="features-image" style={{ width: "100%", height: "160px", position: "relative" }}>
                                                <Image
                                                    src={horse.image_url || "/images/placeholder.jpg"}
                                                    alt={horse.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                            <div className="features-content" style={{ padding: "18px", display: "flex", flexDirection: "column" }}>
                                                <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px", color: "var(--color-text-header)" }}>
                                                    {horse.name}
                                                </h3>
                                                <div style={{ fontSize: "13px", color: "#666" }}>
                                                    {ownerOrTrainerName} • {ageStr}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Trainer Spotlight Section */}
                        <div style={{
                            marginTop: "60px",
                            background: "#fff",
                            borderRadius: "16px",
                            padding: "30px",
                            border: "1px solid #eef0f2",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                        }}>
                            <div style={{ marginBottom: "25px" }}>
                                <h4 style={{
                                    fontSize: "20px",
                                    fontWeight: "800",
                                    color: "#0a2540",
                                    margin: 0
                                }}>Trainer Spotlight</h4>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
                                {trainers && trainers.length > 0 ? (trainers as any[]).map((trainer: any) => {
                                    const name = trainer._source === 'profiles' ? trainer.full_name : trainer.name;
                                    const imageUrl = trainer._source === 'profiles' ? trainer.avatar_url : trainer.image_url;
                                    const specialties = trainer.specialties || (trainer._source === 'profiles' ? ["Performance Trainer"] : []);
                                    const horseCount = trainer.horses?.[0]?.count || 0;

                                    return (
                                        <Link key={trainer.id} href={trainer._source === 'profiles' ? `/profile/${trainer.id}` : `/trainers/${trainer.id}`} style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            textDecoration: "none",
                                        }}
                                            className="trainer-card-hover"
                                        >
                                            <div style={{
                                                width: "100%",
                                                height: "240px",
                                                position: "relative",
                                                borderRadius: "14px",
                                                overflow: "hidden",
                                                marginBottom: "15px",
                                                border: "1px solid #f0f0f0"
                                            }}>
                                                <Image
                                                    src="/images/logo.png"
                                                    alt={name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                            <div style={{ padding: "5px 2px" }}>
                                                <h3 style={{
                                                    fontSize: "17px",
                                                    fontWeight: "700",
                                                    margin: "0 0 5px",
                                                    color: "#0a2540"
                                                }}>
                                                    {name}
                                                </h3>
                                                <div style={{
                                                    fontSize: "14px",
                                                    color: "#5469d4",
                                                    fontWeight: "500",
                                                    marginBottom: "8px",
                                                    lineHeight: "1.4"
                                                }}>
                                                    {specialties?.[0] || "Performance Trainer"}
                                                    {specialties?.[1] && ` & ${specialties[1]}`}
                                                </div>
                                                <div style={{
                                                    fontSize: "13px",
                                                    fontWeight: "500",
                                                    color: "#697386",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}>
                                                    Trained horses: {horseCount}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }) : (
                                    <div style={{ gridColumn: "span 3", padding: "40px", textAlign: "center", color: "#697386", border: "1px dashed #e6ebf1", borderRadius: "12px" }}>
                                        No trainers currently spotlighted
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                        {/* Upcoming Events Area */}
                        <UpcomingEvents />

                        {/* Second Sponsor Ad (Placeholder) */}
                        <div style={{ background: "transparent", padding: "0", border: "none" }}>
                            <div className="section-header">
                                <h4>Sponsor Ad</h4>
                            </div>
                            <div style={{ background: "#ffffff", height: "250px", border: "1px solid #e4e4e4", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
                                <span style={{ color: "#999", fontSize: "12px" }}>AD UNIT (300 x 250)</span>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
