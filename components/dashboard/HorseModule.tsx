"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Horse, Trainer } from "@/types/database";
import { Plus, Edit2, Trash2, Save, X, Loader2, Activity as HorseIcon, Search, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface HorseModuleProps {
    user: any;
}

export default function HorseModule({ user }: HorseModuleProps) {
    const supabase = createClient();
    const [horses, setHorses] = useState<Horse[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentHorse, setCurrentHorse] = useState<any>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [mediaPreviews, setMediaPreviews] = useState<{ id: string, url: string, type: 'image' | 'video' }[]>([]);

    const fetchHorses = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("horses")
                .select("*, trainer:trainers(name)")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setHorses(data || []);
        } catch (error: any) {
            console.error("Error fetching horses:", error.message);
        } finally {
            setLoading(false);
        }
    }, [supabase, user.id]);

    const fetchTrainers = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("trainers")
                .select("id, name")
                .order("name");
            if (error) throw error;
            setTrainers(data || []);
        } catch (error: any) {
            console.error("Error fetching trainers:", error.message);
        }
    }, [supabase]);

    useEffect(() => {
        fetchHorses();
        fetchTrainers();
    }, [fetchHorses, fetchTrainers]);

    const uploadMedia = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('horses')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('horses')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            // 1. Upload new media files if any
            let imageUrl = currentHorse.image_url;
            let videoUrl = currentHorse.video_url;

            const imageFiles = (document.getElementById('picture-upload') as HTMLInputElement)?.files;
            if (imageFiles && imageFiles.length > 0) {
                setStatus({ type: 'success', message: "Uploading image..." });
                imageUrl = await uploadMedia(imageFiles[0], 'images');
            }

            const videoFiles = (document.getElementById('video-upload') as HTMLInputElement)?.files;
            if (videoFiles && videoFiles.length > 0) {
                setStatus({ type: 'success', message: "Uploading video..." });
                videoUrl = await uploadMedia(videoFiles[0], 'videos');
            }

            const horseData: any = {
                ...currentHorse,
                owner_id: user.id,
                image_url: imageUrl,
                video_url: videoUrl,
                updated_at: new Date().toISOString()
            };

            // Clean up UI-only properties
            delete horseData.trainer;

            let error;
            if (currentHorse.id) {
                // Update
                const { error: updateError } = await (supabase
                    .from("horses") as any)
                    .update(horseData)
                    .eq("id", currentHorse.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await (supabase
                    .from("horses") as any)
                    .insert([horseData]);
                error = insertError;
            }

            if (error) {
                if (error.message.includes("column") && error.message.includes("not found")) {
                    throw new Error("Critical: Missing database columns. Please run the SQL script provided in the Walkthrough to update your Supabase schema.");
                }
                throw error;
            }

            setStatus({ type: 'success', message: `Horse ${currentHorse.id ? 'updated' : 'added'} successfully!` });
            setIsEditing(false);
            setCurrentHorse(null);
            fetchHorses();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }

    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this horse? This will also delete its performances.")) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("horses").delete().eq("id", id);
            if (error) throw error;
            setStatus({ type: 'success', message: "Horse deleted successfully!" });
            fetchHorses();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (horse: any = null) => {
        setCurrentHorse(horse || {
            name: "", breed: "", color: "", sex: "Stallion", birth_date: "",
            has_pedigree: false, registry: "", sire: "", dam: "", trainer_id: null,
            is_for_sale: false, sale_price: 0, image_url: "", video_url: ""
        });
        setMediaPreviews([]); // Reset previews when opening
        setIsEditing(true);
        setStatus(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newPreviews = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            type
        }));

        setMediaPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeMedia = (id: string) => {
        setMediaPreviews(prev => {
            const item = prev.find(p => p.id === id);
            if (item) URL.revokeObjectURL(item.url);
            return prev.filter(p => p.id !== id);
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">My Horses</h2>
                    <p className="text-sm text-gray-500">Manage your equine athletes and their profiles.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => openEdit()}
                        className="bg-[var(--color-primary)] hover:bg-[#d98d1f] text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-100"
                    >
                        <Plus size={18} />
                        Add New Horse
                    </button>
                )}
            </div>

            {status && (
                <div className={`p-4 rounded-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{status.message}</p>
                    </div>
                    <button onClick={() => setStatus(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>
            )}

            {isEditing ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{currentHorse.id ? 'Edit Horse' : 'New Horse Profile'}</h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentHorse.name}
                                        onChange={(e) => setCurrentHorse({ ...currentHorse, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-base font-medium"
                                        placeholder="Enter horse name"
                                    />
                                </div>

                                {/* <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Breed</label>
                                        <input
                                            type="text"
                                            value={currentHorse.breed || ""}
                                            onChange={(e) => setCurrentHorse({ ...currentHorse, breed: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Sex</label>
                                        <select
                                            value={currentHorse.sex || "Stallion"}
                                            onChange={(e) => setCurrentHorse({ ...currentHorse, sex: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                        >
                                            {['Stallion', 'Mare', 'Gelding', 'Colt', 'Filly'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div> */}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={currentHorse.birth_date || ""}
                                            onChange={(e) => setCurrentHorse({ ...currentHorse, birth_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                        />
                                    </div>
                                    {/* <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Trainer</label>
                                        <select
                                            value={currentHorse.trainer_id || ""}
                                            onChange={(e) => setCurrentHorse({ ...currentHorse, trainer_id: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                        >
                                            <option value="">None / Private</option>
                                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div> */}
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={currentHorse.has_pedigree}
                                            onChange={(e) => setCurrentHorse({ ...currentHorse, has_pedigree: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                                        <span className="ml-3 text-sm font-bold text-gray-400">Has Pedigree</span>
                                    </label>
                                </div>
                            </div>

                            {/* Right Column - Media Uploads */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2">Pictures</label>
                                    <div
                                        onClick={() => document.getElementById('picture-upload')?.click()}
                                        className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors mb-4"
                                    >
                                        <p className="text-sm font-bold text-blue-900 mb-1">Drop images here or click to upload</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Upload only image files (jpg, png, gif, max 10MB)</p>
                                        <input
                                            id="picture-upload"
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'image')}
                                        />
                                    </div>

                                    {mediaPreviews.filter(p => p.type === 'image').length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                            {mediaPreviews.filter(p => p.type === 'image').map(preview => (
                                                <div key={preview.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                                                    <Image src={preview.url} alt="Preview" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeMedia(preview.id); }}
                                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2">Videos (Optional)</label>
                                    <div
                                        onClick={() => document.getElementById('video-upload')?.click()}
                                        className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors mb-4"
                                    >
                                        <p className="text-sm font-bold text-blue-900 mb-1">Drop videos here or click to upload</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Upload only video files (mp4, avi, mov, max 10MB)</p>
                                        <input
                                            id="video-upload"
                                            type="file"
                                            className="hidden"
                                            accept="video/*"
                                            onChange={(e) => handleFileChange(e, 'video')}
                                        />
                                    </div>

                                    {mediaPreviews.filter(p => p.type === 'video').length > 0 && (
                                        <div className="space-y-2 mb-6">
                                            {mediaPreviews.filter(p => p.type === 'video').map(preview => (
                                                <div key={preview.id} className="relative h-20 rounded-lg overflow-hidden border border-gray-100 bg-black flex items-center justify-center group">
                                                    <video src={preview.url} className="h-full" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeMedia(preview.id); }}
                                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--color-primary)] hover:bg-[#d98d1f] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {currentHorse.id ? 'UPDATE' : 'CREATE'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && horses.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white h-48 rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
                        ))
                    ) : horses.length > 0 ? (
                        horses.map((horse) => (
                            <div key={horse.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="h-32 bg-gray-100 relative overflow-hidden">
                                    {horse.image_url ? (
                                        <Image src={horse.image_url} alt={horse.name} fill className="object-cover" />
                                    ) : (
                                        <div className="inset-0 flex items-center justify-center text-gray-300">
                                            <HorseIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(horse)} className="p-2 bg-white/90 rounded-lg text-blue-600 hover:bg-white shadow-sm transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(horse.id)} className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white shadow-sm transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 mb-1">{horse.name}</h3>
                                    {/* <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider mb-3">
                                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{horse.sex}</span>
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{horse.breed || 'Unknown Breed'}</span>
                                    </div> */}
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Born: {horse.birth_date ? new Date(horse.birth_date).getFullYear() : 'Unknown'}</span>
                                        <span>Trainer: {horse.trainer?.name || 'Private'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <div className="p-4 bg-white rounded-full shadow-sm text-gray-300 mb-4">
                                <Search size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">No horses found in your records.</p>
                            <button onClick={() => openEdit()} className="mt-4 text-[var(--color-primary)] font-bold text-sm hover:underline">
                                Register your first horse
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
