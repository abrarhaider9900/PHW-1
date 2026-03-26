"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit2,
    Trash2,
    Activity,
    Search,
    X,
    Check,
    Save
} from "lucide-react";

export default function AdminDisciplineModule() {
    const supabase = createClient();
    const [disciplines, setDisciplines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", icon: "Activity" });

    const fetchDisciplines = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("disciplines")
            .select("*")
            .order("id");

        if (!error && data) {
            setDisciplines(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchDisciplines();
    }, [fetchDisciplines]);

    const handleSave = async (id?: string | number) => {
        if (!formData.name) return;

        // Build payload with only columns that exist in the DB
        const payload: Record<string, any> = { name: formData.name };
        if (formData.description) payload.description = formData.description;

        try {
            if (id) {
                const { error } = await (supabase
                    .from("disciplines") as any)
                    .update(payload)
                    .eq("id", id);
                if (error) throw error;
                setEditingId(null);
                fetchDisciplines();
            } else {
                const { error } = await (supabase
                    .from("disciplines") as any)
                    .insert([payload]);
                if (error) throw error;
                setIsAdding(false);
                setFormData({ name: "", description: "", icon: "Activity" });
                fetchDisciplines();
            }
        } catch (error: any) {
            console.error('Error saving discipline:', error);
            alert(`Error saving discipline: ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This may affect horses assigned to this discipline.")) return;
        const { error } = await supabase
            .from("disciplines")
            .delete()
            .eq("id", id);
        if (!error) fetchDisciplines();
    };

    const startEdit = (discipline: any) => {
        setEditingId(discipline.id);
        setFormData({ name: discipline.name, description: discipline.description || "", icon: discipline.icon || "Activity" });
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase">Disciplines Management</h2>
                    <p className="text-gray-500 text-sm font-medium">Add or edit horse disciplines and sports</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl shadow-lg shadow-orange-900/20 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all"
                >
                    <Plus size={18} />
                    Add Discipline
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAdding && (
                    <div className="bg-white p-6 rounded-[24px] border-2 border-dashed border-[var(--color-primary)] flex flex-col gap-4 shadow-sm">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:border-[var(--color-primary)]"
                                placeholder="e.g. Barrel Racing"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Description</label>
                            <textarea
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium outline-none focus:border-[var(--color-primary)] h-24"
                                placeholder="Describe the discipline..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => handleSave()}
                                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2"
                            >
                                <Check size={14} /> Save
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2"
                            >
                                <X size={14} /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-400 uppercase text-xs">Loading disciplines...</div>
                ) : disciplines.length === 0 && !isAdding ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-400 uppercase text-xs">No disciplines found</div>
                ) : (
                    disciplines.map((d) => (
                        <div key={d.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm transition-all hover:shadow-md group relative">
                            {editingId === d.id ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <textarea
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium h-24"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSave(d.id)} className="flex-1 py-2 bg-green-500 text-white rounded-lg font-black text-[10px] uppercase">Update</button>
                                        <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-black text-[10px] uppercase">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[var(--color-primary)] mb-4">
                                        <Activity size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-2">{d.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-3 mb-6">{d.description || "No description provided."}</p>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6">
                                        <button
                                            onClick={() => startEdit(d)}
                                            className="p-2 bg-gray-50 text-gray-400 hover:text-[var(--color-primary)] rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
