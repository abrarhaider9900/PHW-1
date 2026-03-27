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

    const { data: performancesData } = await (supabase
        .from("performances")
        .select("*, horse:horses(*, trainer:trainers(*)), discipline:disciplines(*)")
        .eq("is_top_performance", true)
        .order("performance_date", { ascending: false }) as any);
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
                        <div style={{
                            marginTop: "40px",
                            background: "#ffffff",
                            borderRadius: "24px",
                            padding: "32px",
                            border: "1px solid #f0f0f0",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                        }}>
                            <div style={{ marginBottom: "28px" }}>
                                <h4 style={{
                                    fontSize: "20px",
                                    fontWeight: "850",
                                    color: "#071437",
                                    letterSpacing: "-0.02em"
                                }}>
                                    Trending Horses
                                </h4>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 240px))", gap: "20px" }}>
                                {trendingHorses && (trendingHorses as any[]).map((horse: any) => {
                                    let ageStr = "N/A";
                                    if (horse.date_of_birth) {
                                        const birthDate = new Date(horse.date_of_birth);
                                        const age = new Date().getFullYear() - birthDate.getFullYear();
                                        ageStr = age >= 0 ? `${age} years` : "0 years";
                                    } else if (horse.birth_year) {
                                        const age = new Date().getFullYear() - horse.birth_year;
                                        ageStr = `${age} years`;
                                    }

                                    const ownerOrTrainerName = (horse.owner as any)?.full_name || horse.trainer?.name || "Unknown";

                                    return (
                                        <Link key={horse.id} href={`/Stallions/${horse.id}`}
                                            className="premium-card-hover"
                                            style={{
                                                textDecoration: "none",
                                                display: "flex",
                                                flexDirection: "column",
                                                background: "#ffffff",
                                                borderRadius: "16px",
                                                overflow: "hidden",
                                                border: "1px solid #f0f0f0",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                                            }}>
                                            <div style={{ width: "100%", height: "150px", position: "relative" }}>
                                                <Image
                                                    src={horse.image_url || "/images/placeholder.jpg"}
                                                    alt={horse.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                            <div style={{ padding: "12px", display: "flex", flexDirection: "column" }}>
                                                <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 4px", color: "#071437" }}>
                                                    {horse.name}
                                                </h3>
                                                <div style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>
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
                            marginTop: "40px",
                            background: "#ffffff",
                            borderRadius: "24px",
                            padding: "32px",
                            border: "1px solid #f0f0f0",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                        }}>
                            <div style={{ marginBottom: "28px" }}>
                                <h4 style={{
                                    fontSize: "20px",
                                    fontWeight: "850",
                                    color: "#071437",
                                    letterSpacing: "-0.02em"
                                }}>Trainer Spotlight</h4>
                            </div>                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 280px))", gap: "25px" }}>
                                {trainers && trainers.length > 0 ? (trainers as any[]).map((trainer: any) => {
                                    const name = trainer._source === 'profiles' ? trainer.full_name : trainer.name;
                                    const specialties = trainer.specialties || (trainer._source === 'profiles' ? ["Performance Trainer"] : []);
                                    const horseCount = trainer.horses?.[0]?.count || 0;
                                    const location = trainer.origin || trainer.location || "N/A";

                                    return (
                                        <Link key={trainer.id} href={trainer._source === 'profiles' ? `/profile/${trainer.id}` : `/trainers/${trainer.id}`}
                                            className="trainer-card-hover"
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                textDecoration: "none",
                                                background: "#ffffff",
                                                borderRadius: "18px",
                                                overflow: "hidden",
                                                border: "1px solid #f0f0f0",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                                            }}>
                                            <div style={{
                                                width: "100%",
                                                height: "220px",
                                                position: "relative",
                                                overflow: "hidden",
                                                background: "#f8fafb"
                                            }}>
                                                <div className="trainer-img-zoom" style={{ width: "100%", height: "100%", position: "relative", transition: "transform 0.5s ease" }}>
                                                    <Image
                                                        src={trainer.profile_image_url || "/images/logo.png"}
                                                        alt={name}
                                                        fill
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ padding: "16px" }}>
                                                <h3 style={{
                                                    fontSize: "16px",
                                                    fontWeight: "800",
                                                    margin: "0 0 4px",
                                                    color: "#071437"
                                                }}>
                                                    {name}
                                                </h3>
                                                <div style={{
                                                    fontSize: "13px",
                                                    color: "#666",
                                                    fontWeight: "600",
                                                    marginBottom: "4px",
                                                }}>
                                                    {specialties?.[0] || "Performance Trainer"}
                                                </div>
                                                <div style={{
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                    color: "#00a884",
                                                }}>
                                                    Trained horses: {horseCount}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }) : (
                                    <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#999", border: "1px dashed #e0e0e0", borderRadius: "16px" }}>
                                        No trainers currently spotlighted
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        {/* Upcoming Events Area */}
                        <UpcomingEvents />

                        {/* Sponsor Ad Area */}
                        <div style={{
                            background: "#ffffff",
                            borderRadius: "24px",
                            padding: "32px",
                            border: "1px solid #f0f0f0",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                        }}>
                            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h4 style={{
                                    fontSize: "18px",
                                    fontWeight: "850",
                                    color: "#071437",
                                    margin: 0
                                }}>
                                    Sponsor
                                </h4>
                                <span style={{ background: "#071437", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>AD</span>
                            </div>
                            <div style={{
                                background: "#f8fafb",
                                height: "250px",
                                border: "1px solid #eef0f2",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "16px",
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                <Image
                                    src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Sponsor Ad"
                                    fill
                                    style={{ objectFit: "cover", opacity: 0.8 }}
                                />
                                <div style={{
                                    position: "relative",
                                    zIndex: 1,
                                    textAlign: "center",
                                    color: "#fff",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                                }}>
                                    <div style={{ fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>Sponsor Ad Dimension</div>
                                    <div style={{ fontSize: "12px", fontWeight: "600" }}>300 x 250</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
