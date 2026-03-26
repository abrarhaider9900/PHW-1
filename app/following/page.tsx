import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HorseCard from "@/components/horses/HorseCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Following | Performance Horse World" };

export default async function FollowingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: follows } = await (supabase
        .from("horse_follows")
        .select("horse:horses(*, trainer:trainers(*), owner:profiles(*))")
        .eq("user_id", user.id) as any);

    const horses = follows?.map((f: any) => f.horse).filter(Boolean) || [];

    return (
        <div className="container-phw" style={{ paddingTop: "24px", paddingBottom: "24px" }}>
            <div className="section-header" style={{ marginBottom: "20px" }}>Horses You Are Following</div>

            {horses && horses.length > 0 ? (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                    gap: "12px",
                }}>
                    {horses.map((horse: any) => (
                        <HorseCard key={horse.id} horse={horse} />
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: "40px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🤍</div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
                        You aren&apos;t following any horses yet.
                    </p>
                    <a href="/allhorses" className="btn-primary">Explore Horses</a>
                </div>
            )}
        </div>
    );
}
