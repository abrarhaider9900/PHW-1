import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getCurrentProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await (supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single() as any);

    return profile;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return user;
}

export async function requireAdmin() {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "admin") throw new Error("Forbidden");
    return profile;
}
