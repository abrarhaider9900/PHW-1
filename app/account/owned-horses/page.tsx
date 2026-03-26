import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Plus, Search, Activity as HorseIcon } from "lucide-react";
import type { Metadata } from "next";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
    title: "My Owned Horses | Performance Horse World",
    description: "Manage and view all horses currently owned by you.",
};

export default async function OwnedHorsesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch horses owned by the current user
    const { data: horses, error } = await supabase
        .from("horses")
        .select("*, trainer:trainers(name)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }) as { data: any[] | null, error: any };

    if (error) {
        console.error("Error fetching owned horses:", error.message);
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] py-12">
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                            Owned Horses
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-1 bg-[var(--color-primary)] rounded-full"></span>
                            <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">
                                Your Equine Roster
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard"
                        className="bg-[var(--color-primary)] hover:bg-[#d98d1f] text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-100 self-start"
                    >
                        <Plus size={20} strokeWidth={3} />
                        REGISTER NEW HORSE
                    </Link>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                    {!horses || horses.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[var(--color-primary)] mb-6">
                                <Search size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">No Horses Found</h2>
                            <p className="text-gray-500 max-w-md mb-8 font-medium">
                                You haven&apos;t registered any horses under your ownership yet. Register your first horse to start tracking performances.
                            </p>
                            <Link
                                href="/dashboard"
                                className="text-[var(--color-primary)] font-black uppercase text-sm tracking-widest hover:underline flex items-center gap-2"
                            >
                                Go to Dashboard <ChevronRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Horse</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Birth Year</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {horses.map((horse) => (
                                        <tr key={horse.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-100 shadow-sm flex-shrink-0">
                                                        {horse.image_url ? (
                                                            <Image
                                                                src={horse.image_url}
                                                                alt={horse.name}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <HorseIcon size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-gray-900 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                                                            {horse.name}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                                                            Trainer: {horse.trainer?.name || "Private"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-sm font-bold text-gray-600">
                                                    {horse.birth_date ? new Date(horse.birth_date).getFullYear() : (horse.birth_year || "—")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link
                                                    href={`/Stallions/${horse.id}`}
                                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 shadow-sm"
                                                    title="View Profile"
                                                >
                                                    <ChevronRight size={20} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Bottom navigation hint */}
                <div className="mt-8 flex items-center justify-center">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Performance Horse World • My Account
                    </p>
                </div>
            </div>
        </div>
    );
}
