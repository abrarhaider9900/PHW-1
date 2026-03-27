"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit2,
    Trash2,
    Lock,
    Search,
    X,
    Check,
    AlertCircle
} from "lucide-react";

export default function AdminPermissionsModule() {
    const supabase = createClient();
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ name: "", description: "" });

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("permissions")
            .select("*")
            .order("name");

        if (!error && data) {
            setPermissions(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const handleSave = async (id?: number) => {
        if (!formData.name) {
            setError("Permission name is required");
            return;
        }

        try {
            setError("");
            if (id) {
                const { error } = await (supabase.from("permissions") as any).update(formData).eq("id", id);
                if (error) throw error;
                setEditingId(null);
            } else {
                const { error } = await (supabase.from("permissions") as any).insert([formData]);
                if (error) throw error;
                setIsAdding(false);
                setFormData({ name: "", description: "" });
            }
            fetchPermissions();
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this permission? This may affect roles that use it.")) return;
        const { error } = await supabase.from("permissions").delete().eq("id", id);
        if (!error) fetchPermissions();
    };

    const startEdit = (permission: any) => {
        setEditingId(permission.id);
        setFormData({ name: permission.name, description: permission.description || "" });
        setError("");
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Permissions Library</h2>
                    <p className="text-gray-500 text-sm font-medium">Define custom granular permissions for your platform</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setFormData({ name: "", description: "" });
                        setError("");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20 font-black text-xs uppercase tracking-wider hover:bg-black transition-all"
                >
                    <Plus size={18} />
                    New Permission
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAdding && (
                    <div className="bg-white p-6 rounded-[24px] border-2 border-dashed border-gray-900/10 flex flex-col gap-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Permission Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:border-gray-900"
                                placeholder="e.g. can_delete_horses"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Description</label>
                            <textarea
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium outline-none focus:border-gray-900 h-24"
                                placeholder="What does this permission allow?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => handleSave()}
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-black transition-colors"
                            >
                                <Check size={14} /> Create
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                            >
                                <X size={14} /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-400 uppercase text-xs">Loading permissions...</div>
                ) : permissions.length === 0 && !isAdding ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-400 uppercase text-xs bg-white rounded-[32px] border border-dashed border-gray-200">
                        No custom permissions defined.
                    </div>
                ) : (
                    permissions.map((p) => (
                        <div key={p.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
                            {editingId === p.id ? (
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
                                        <button onClick={() => handleSave(p.id)} className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-black text-[10px] uppercase">Update</button>
                                        <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-black text-[10px] uppercase">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[var(--color-primary)] mb-4 shadow-sm border border-orange-100">
                                        <Lock size={18} />
                                    </div>
                                    <h3 className="text-md font-black text-gray-800 mb-1.5 uppercase tracking-tight">{p.name}</h3>
                                    <p className="text-xs text-gray-400 font-medium line-clamp-2">{p.description || "No description provided."}</p>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6">
                                        <button
                                            onClick={() => startEdit(p)}
                                            className="p-2 bg-white text-gray-400 hover:text-gray-900 rounded-lg shadow-sm border border-gray-100 transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-lg shadow-sm border border-gray-100 transition-colors"
                                        >
                                            <Trash2 size={14} />
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
