import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Performance Horse World" };

import DashboardTabs from "@/components/dashboard/DashboardTabs";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        const { data: newProfile, error: createError } = await (supabase
            .from("profiles") as any)
            .insert([{
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                role: 'user',
                status: 'active'
            }])
            .select()
            .single();

        if (!createError) {
            profile = newProfile;
        }
    }

    const isAdmin = (profile as any)?.role === 'admin';

    if (isAdmin) {
        return <AdminDashboard user={user} profile={profile} />;
    }

    return (
        <div className="min-h-screen bg-[#f1f1f1] py-12">
            <div className="max-w-[1240px] mx-auto px-10">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-1 bg-[var(--color-primary)] rounded-full"></span>
                        <p className="text-gray-500 font-medium">
                            Welcome back, <span className="text-gray-900 font-bold">{(profile as any)?.full_name || user.email?.split('@')[0]}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-white shadow-2xl shadow-gray-200/50">
                    <DashboardTabs user={user} profile={profile} />
                </div>
            </div>
        </div>
    );
}

