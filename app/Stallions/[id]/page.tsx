import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import HorseProfileClient from "@/components/horses/HorseProfileClient";

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("horses")
        .select("name, breed, color")
        .eq("id", parseInt(id))
        .single();

    const horse = data as any;

    if (!horse) return { title: "Horse Not Found" };
    return {
        title: `${horse.name} | Performance Horse World`,
        description: `${horse.color ?? ""} ${horse.breed ?? ""} performance horse profile`,
    };
}

export default async function HorseDetailPage({ params }: Props) {
    const { id } = params;
    const supabase = await createClient();

    // 1. Get current user for owner check
    const { data: { user } } = await supabase.auth.getUser();
    let isOwner = false;
    
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        
        isOwner = (profile as any)?.role === 'admin';
    }

    // 2. Fetch Horse Data
    console.log("Fetching Horse ID:", id);
    const { data: horseData, error } = await supabase
        .from("horses")
        .select("*, trainer:trainers(*), owner:profiles(*)")
        .eq("id", parseInt(id))
        .single();
    
    if (error) console.error("Supabase Error:", error.message);
    if (!horseData) {
        console.log("Horse NOT FOUND in DB for ID:", id);
        notFound();
    }

    const horse = horseData as any;

    if (user && horse.owner_id === user.id) {
        isOwner = true;
    }

    // 3. Fetch Performances with relations
    const { data: performances } = await supabase
        .from("performances")
        .select("*, event:events(*), discipline:disciplines(*)")
        .eq("horse_id", horse.id)
        .order("performance_date", { ascending: false });

    return (
        <HorseProfileClient 
            horse={horseData} 
            performances={performances || []} 
            isOwner={isOwner} 
        />
    );
}
