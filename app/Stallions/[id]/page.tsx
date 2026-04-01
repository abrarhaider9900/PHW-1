import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import HorseDetails from "@/components/horses/details/HorseDetails";

interface Props {
    params: { id: string };
}

export const dynamic = "force-dynamic";

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
    const horseId = Number(id);
    if (!Number.isFinite(horseId)) notFound();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 2. Fetch Horse Data (keep query simple; join separately to avoid relationship/RLS edge-cases)
    const { data: horseRowRaw, error: horseError } = await supabase
        .from("horses")
        .select("*")
        .eq("id", horseId)
        .maybeSingle();

    if (horseError) {
        console.error("[Stallions/[id]] horse fetch error", { horseId, message: horseError.message });
        throw new Error("Failed to load horse");
    }

    if (!horseRowRaw) notFound();

    const horseRow = horseRowRaw as any;

    const [trainerRes, ownerRes] = await Promise.all([
        horseRow.trainer_id
            ? (supabase.from("trainers").select("*").eq("id", horseRow.trainer_id).maybeSingle() as any)
            : Promise.resolve({ data: null, error: null }),
        horseRow.owner_id
            ? (supabase.from("profiles").select("*").eq("id", horseRow.owner_id).maybeSingle() as any)
            : Promise.resolve({ data: null, error: null }),
    ]);

    if (trainerRes.error) {
        console.error("[Stallions/[id]] trainer fetch error", { horseId, message: trainerRes.error.message });
    }
    if (ownerRes.error) {
        console.error("[Stallions/[id]] owner fetch error", { horseId, message: ownerRes.error.message });
    }

    const horse = {
        ...(horseRow as any),
        trainer: trainerRes.data ?? null,
        owner: ownerRes.data ?? null,
    } as any;

    // 1. Determine viewer permissions (admin/owner can see owner tools)
    let viewerRole: string | null = null;
    const isLoggedIn = Boolean(user);
    const isHorseOwner = Boolean(user && horse.owner_id === user.id);
    let isAdmin = false;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        viewerRole = (profile as any)?.role ?? null;
        isAdmin = viewerRole === "admin";
    }

    const canOwnerView = isAdmin || isHorseOwner;

    // 3. Fetch Performances with relations
    const { data: performances } = await supabase
        .from("performances")
        .select("*, event:events(*), discipline:disciplines(*)")
        .eq("horse_id", horse.id)
        .order("performance_date", { ascending: false });

    return (
        <HorseDetails
            horse={horse as any}
            performances={performances || []}
            isLoggedIn={isLoggedIn}
            canOwnerView={canOwnerView}
        />
    );
}
