"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    User,
    Edit2,
    Trash2,
    Search,
    UserCircle,
    Mail,
    Phone,
    Globe,
    Check,
    Star,
    X
} from "lucide-react";
import Image from "next/image";

interface AdminProfileModuleProps {
    type: string;
}

export default function AdminProfileModule({ type }: AdminProfileModuleProps) {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            if (type === 'Trainer') {
                // Fetch both from trainers table and profiles with trainer role
                const [trainersRes, profilesRes] = await Promise.all([
                    (supabase.from("trainers") as any).select("*"),
                    (supabase.from("profiles") as any).select("*").contains('functional_roles', ['trainer'])
                ]);

                // Merge and label them
                const merged = [
                    ...(trainersRes.data || []).map((t: any) => ({ ...t, _source: 'trainers' })),
                    ...(profilesRes.data || []).map((p: any) => ({ ...p, _source: 'profiles' }))
                ];
                setProfiles(merged);
            } else if (type === 'User') {
                // For "User Profiles", show users whose system role is 'user'
                const { data, error } = await (supabase.from("profiles") as any)
                    .select("*")
                    .eq('role', 'user')
                    .order("created_at", { ascending: false });
                if (!error && data) setProfiles(data);
            } else {
                // Filter by functional_roles array containing the lowercased type
                const { data, error } = await (supabase.from("profiles") as any)
                    .select("*")
                    .contains('functional_roles', [type.toLowerCase()])
                    .order("created_at", { ascending: false });
                if (!error && data) setProfiles(data);
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase, type]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleToggleSpotlight = async (profile: any) => {
        try {
            const table = profile._source || (type === 'User' ? 'profiles' : 'profiles'); 
            // Default to profiles if source not explicitly labeled (for non-trainer types)
            
            const { error } = await (supabase
                .from(table) as any)
                .update({ is_spotlight: !profile.is_spotlight })
                .eq('id', profile.id);

            if (error) throw error;
            
            // Optimistic update
            setProfiles(prev => prev.map(p => 
                p.id === profile.id ? { ...p, is_spotlight: !p.is_spotlight } : p
            ));
        } catch (error) {
            console.error("Error toggling spotlight:", error);
            alert("Failed to update spotlight status");
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProfile) return;

        setUpdating(true);
        try {
            const table = editingProfile._source || 'profiles';
            const dataToUpdate: any = {
                bio: editingProfile.bio,
                phone: editingProfile.phone,
                email: editingProfile.email,
            };

            if (table === 'trainers') {
                dataToUpdate.name = editingProfile.name;
                dataToUpdate.location = editingProfile.location;
                dataToUpdate.specialties = typeof editingProfile.specialties === 'string' 
                    ? editingProfile.specialties.split(',').map((s: string) => s.trim())
                    : editingProfile.specialties;
            } else {
                dataToUpdate.full_name = editingProfile.full_name;
            }

            const { error } = await (supabase
                .from(table) as any)
                .update(dataToUpdate)
                .eq('id', editingProfile.id);

            if (error) throw error;

            setProfiles(prev => prev.map(p => 
                p.id === editingProfile.id ? { ...p, ...dataToUpdate } : p
            ));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteProfile = async (profile: any) => {
        if (!confirm(`Are you sure you want to delete ${profile.full_name || profile.name}'s profile?`)) return;

        try {
            const table = profile._source || 'profiles';
            const { error } = await (supabase
                .from(table) as any)
                .delete()
                .eq('id', profile.id);

            if (error) throw error;

            setProfiles(prev => prev.filter(p => p.id !== profile.id));
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("Failed to delete profile");
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase">{type} Profiles</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage details and credentials for {type}s</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-400 uppercase text-xs">Loading {type}s...</div>
                ) : profiles.length === 0 ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-400 uppercase text-xs">No {type} profiles found</div>
                ) : (
                    profiles.map((p) => (
                        <div key={p.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm relative">
                                    {p.avatar_url || p.image_url ? (
                                        <Image src={p.avatar_url || p.image_url} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-orange-50 flex items-center justify-center text-[var(--color-primary)] font-bold text-xl uppercase">
                                            {(p.full_name || p.name)?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 leading-tight">{p.full_name || p.name}</h3>
                                        {type === 'Trainer' && (
                                            <button 
                                                onClick={() => handleToggleSpotlight(p)}
                                                className={`transition-colors ${p.is_spotlight ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                                                title={p.is_spotlight ? "Featured in Spotlight" : "Add to Spotlight"}
                                            >
                                                <Star size={16} fill={p.is_spotlight ? "currentColor" : "none"} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{type}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Mail size={14} className="text-gray-300" />
                                    {p.email || "No email provided"}
                                </div>
                                {p.bio && (
                                    <p className="text-xs text-gray-400 font-medium line-clamp-2 italic">{p.bio}</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button 
                                    onClick={() => {
                                        setEditingProfile({ ...p });
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg font-black text-[10px] uppercase hover:bg-[var(--color-primary)] hover:text-white transition-all"
                                >
                                    Edit Details
                                </button>
                                <button 
                                    onClick={() => handleDeleteProfile(p)}
                                    className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingProfile && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase">Edit Profile</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Source: {editingProfile._source || 'profiles'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Name</label>
                                    <input 
                                        type="text" 
                                        value={editingProfile._source === 'trainers' ? editingProfile.name : editingProfile.full_name}
                                        onChange={(e) => setEditingProfile({ 
                                            ...editingProfile, 
                                            [editingProfile._source === 'trainers' ? 'name' : 'full_name']: e.target.value 
                                        })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        value={editingProfile.email || ''}
                                        onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phone</label>
                                    <input 
                                        type="text" 
                                        value={editingProfile.phone || ''}
                                        onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                                    />
                                </div>

                                {editingProfile._source === 'trainers' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Location</label>
                                            <input 
                                                type="text" 
                                                value={editingProfile.location || ''}
                                                onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Specialties (comma separated)</label>
                                            <input 
                                                type="text" 
                                                value={Array.isArray(editingProfile.specialties) ? editingProfile.specialties.join(', ') : editingProfile.specialties || ''}
                                                onChange={(e) => setEditingProfile({ ...editingProfile, specialties: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Bio</label>
                                    <textarea 
                                        rows={4}
                                        value={editingProfile.bio || ''}
                                        onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="flex-[2] py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
