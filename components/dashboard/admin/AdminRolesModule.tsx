"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit2,
    Trash2,
    Shield,
    Check,
    X,
    AlertCircle,
    ChevronRight
} from "lucide-react";

export default function AdminRolesModule() {
    const supabase = createClient();
    const [roles, setRoles] = useState<any[]>([]);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [rolePermissions, setRolePermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                { data: rolesData },
                { data: permsData },
                { data: rpData }
            ] = await Promise.all([
                supabase.from("roles").select("*").order("name"),
                supabase.from("permissions").select("*").order("name"),
                supabase.from("role_permissions").select("role_id, permission_id")
            ]);

            setRoles(rolesData || []);
            setAllPermissions(permsData || []);
            setRolePermissions(rpData || []);
        } catch (err) {
            console.error("Error fetching roles data:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (id?: number) => {
        if (!formData.name) {
            setError("Role name is required");
            return;
        }

        try {
            setLoading(true);
            setError("");
            let roleId = id;

            // 1. Save/Update Role
            if (id) {
                const { error } = await (supabase.from("roles") as any).update(formData).eq("id", id);
                if (error) throw error;
            } else {
                const { data, error } = await (supabase.from("roles") as any).insert([formData]).select();
                if (error) throw error;
                roleId = data[0].id;
            }

            // 2. Sync Permissions
            await (supabase.from("role_permissions") as any).delete().eq("role_id", roleId);

            if (selectedPermissions.length > 0) {
                const relations = selectedPermissions.map(pId => ({
                    role_id: roleId,
                    permission_id: pId
                }));
                const { error } = await (supabase.from("role_permissions") as any).insert(relations);
                if (error) throw error;
            }

            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: "", description: "" });
            setSelectedPermissions([]);
            fetchData();
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        const { error } = await supabase.from("roles").delete().eq("id", id);
        if (!error) fetchData();
    };

    const startEdit = (role: any) => {
        setEditingId(role.id);
        setFormData({ name: role.name, description: role.description || "" });
        const currentPerms = rolePermissions
            .filter(rp => rp.role_id === role.id)
            .map(rp => rp.permission_id);
        setSelectedPermissions(currentPerms);
        setError("");
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const getRolePerms = (roleId: number) => {
        const permIds = rolePermissions
            .filter(rp => rp.role_id === roleId)
            .map(rp => rp.permission_id);
        return allPermissions.filter(p => permIds.includes(p.id));
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Role Definitions</h2>
                    <p className="text-gray-500 text-sm font-medium">Group permissions into custom administrative roles</p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setFormData({ name: "", description: "" });
                            setSelectedPermissions([]);
                            setError("");
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20 font-black text-xs uppercase tracking-wider hover:bg-black transition-all"
                    >
                        <Plus size={18} />
                        Add New Role
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="mb-12 bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-gray-900 uppercase">{editingId ? 'Edit Role' : 'Create Custom Role'}</h3>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-900 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Role Name</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-gray-900 transition-all"
                                    placeholder="e.g. Content Moderator"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Description</label>
                                <textarea
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:border-gray-900 transition-all h-32 resize-none"
                                    placeholder="Briefly describe the responsibilities of this role..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Assign Permissions</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-6 max-h-[300px] overflow-y-auto grid grid-cols-1 gap-2">
                                {allPermissions.length > 0 ? (
                                    allPermissions.map((permission) => {
                                        const isSelected = selectedPermissions.includes(permission.id);
                                        return (
                                            <button
                                                key={permission.id}
                                                type="button"
                                                onClick={() => togglePermission(permission.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                    ? 'bg-white border-orange-200 shadow-sm'
                                                    : 'bg-transparent border-transparent hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--color-primary)] text-white shadow-md shadow-orange-900/10' : 'bg-white border border-gray-100 text-gray-300'
                                                        }`}>
                                                        {isSelected ? <Check size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
                                                        {permission.name}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-gray-400 font-bold uppercase italic p-4 text-center">No permissions found. Create them in the Permissions tab.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-10">
                        <button
                            onClick={() => { setIsAdding(false); setEditingId(null); }}
                            className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSave(editingId || undefined)}
                            disabled={loading}
                            className="px-10 py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : editingId ? 'Update Role' : 'Create Role'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {loading && !isAdding && !editingId ? (
                    <div className="py-20 text-center font-black text-gray-400 uppercase text-xs">Loading roles...</div>
                ) : roles.length === 0 && !isAdding && !editingId ? (
                    <div className="py-20 text-center font-black text-gray-400 uppercase text-xs bg-white rounded-[40px] border border-dashed border-gray-200">
                        No custom roles defined.
                    </div>
                ) : (
                    roles.map((r) => {
                        const perms = getRolePerms(r.id);
                        return (
                            <div key={r.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 bg-purple-50 rounded-[18px] flex items-center justify-center text-purple-500 shadow-sm border border-purple-100">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{r.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{r.description || "No description provided."}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        {perms.length > 0 ? (
                                            perms.map(p => (
                                                <span key={p.id} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                    {p.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase italic">No permissions assigned</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-8 right-8">
                                    <button
                                        onClick={() => startEdit(r)}
                                        className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm border border-gray-100 transition-all hover:scale-105"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl shadow-sm border border-gray-100 transition-all hover:scale-105"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
