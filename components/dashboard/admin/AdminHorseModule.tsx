"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit2,
    Trash2,
    ClipboardList,
    Search,
    Filter,
    ChevronRight,
    Activity
} from "lucide-react";
import Image from "next/image";

export default function AdminHorseModule() {
    const supabase = createClient();
    const [horses, setHorses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHorses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await (supabase
            .from("horses") as any)
            .select(`
                *,
                owner:profiles!owner_id(full_name),
                trainer:trainers(name)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching horses in admin module:", error);
        } else if (data) {
            console.log("Admin fetched horses:", data);
            setHorses(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchHorses();
    }, [fetchHorses]);

    const filteredHorses = horses.filter(horse =>
        (horse.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (horse.breed?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this horse and all its performance records?")) return;
        const { error } = await supabase.from("horses").delete().eq("id", id);
        if (!error) fetchHorses();
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase flex items-center gap-3">
                        Horse Management
                        <span className="bg-orange-100 text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-black">
                            {horses.length} TOTAL
                        </span>
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">Manage all equine athletes and their stats</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-3 w-64">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find horse..."
                            className="bg-transparent border-none outline-none text-xs font-bold uppercase w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horse</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner / Trainer</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">Loading horses...</td></tr>
                        ) : filteredHorses.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">No horses found</td></tr>
                        ) : (
                            filteredHorses.map((horse) => (
                                <tr key={horse.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200">
                                                {horse.image_url ? (
                                                    <Image src={horse.image_url} alt={horse.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Activity size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{horse.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                <span className="text-gray-400">Owner:</span> {horse.owner?.full_name || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-orange-50 rounded-lg transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(horse.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
