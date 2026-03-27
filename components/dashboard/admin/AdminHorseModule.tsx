import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    ChevronRight,
    Activity,
    X,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Trophy,
    User
} from "lucide-react";
import Image from "next/image";

type SubTab = "horses" | "performances";

const EVENT_TYPES = ["Rodeo", "Futurity", "Derby", "Classic", "Jackpot", "Show", "Exhibition", "Other"];
const DIVISIONS = ["Open", "Youth", "Amateur", "Non-Pro", "Novice", "Limited", "Beginner", "Masters", "Senior", "Ladies"];
const PRIORITIES = ["High", "Medium", "Low"];
const COUNTRIES = ["USA", "Canada", "Mexico", "Australia", "Brazil", "Other"];
const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

export default function AdminHorseModule() {
    const supabase = createClient();
    const [subTab, setSubTab] = useState<SubTab>("horses");
    const [horses, setHorses] = useState<any[]>([]);
    const [performances, setPerformances] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [disciplines, setDisciplines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [mediaPreviews, setMediaPreviews] = useState<{ id: string, url: string, type: 'image' | 'video' | 'doc' }[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Horses
            const { data: horsesData } = await (supabase
                .from("horses") as any)
                .select(`*, owner:profiles!owner_id(full_name), trainer:trainers(name)`)
                .order("created_at", { ascending: false });
            setHorses(horsesData || []);

            // Fetch Performances
            const { data: perfData } = await (supabase
                .from("performances") as any)
                .select("*, horse:horses(name, trainer:trainers(name), image_url), event:events(name, date), discipline:disciplines(name)")
                .order("created_at", { ascending: false });
            setPerformances(perfData || []);

            // Fetch Disciplines
            const { data: disciplinesData } = await supabase
                .from("disciplines")
                .select("*")
                .order("name");
            setDisciplines(disciplinesData || []);

            // Fetch Profiles (for owner selection)
            const { data: profileData } = await supabase
                .from("profiles")
                .select("id, full_name")
                .order("full_name");
            setProfiles(profileData || []);

        } catch (error) {
            console.error("Error fetching admin horse data:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const uploadMedia = async (file: File, path: string, ownerId: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${ownerId}/${path}/${fileName}`;

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
            const table = subTab === "horses" ? "horses" : "performances";
            const data = { ...currentItem };

            // 1. Media handling
            let ownerId = subTab === "horses" ? currentItem.owner_id : horses.find(h => h.id === currentItem.horse_id)?.owner_id;

            // Handle image/video for horse
            if (subTab === "horses") {
                const imageFiles = (document.getElementById('picture-upload') as HTMLInputElement)?.files;
                if (imageFiles && imageFiles.length > 0) {
                    setStatus({ type: 'success', message: "Uploading image..." });
                    data.image_url = await uploadMedia(imageFiles[0], 'images', ownerId);
                }
                const videoFiles = (document.getElementById('video-upload') as HTMLInputElement)?.files;
                if (videoFiles && videoFiles.length > 0) {
                    setStatus({ type: 'success', message: "Uploading video..." });
                    data.video_url = await uploadMedia(videoFiles[0], 'videos', ownerId);
                }
            }

            // Handle video/doc for performance
            if (subTab === "performances") {
                const videoFiles = (document.getElementById('perf-video-upload') as HTMLInputElement)?.files;
                if (videoFiles && videoFiles.length > 0) {
                    setStatus({ type: 'success', message: "Uploading performance video..." });
                    data.video_url = await uploadMedia(videoFiles[0], 'perf_videos', ownerId);
                }
                const docFiles = (document.getElementById('perf-doc-upload') as HTMLInputElement)?.files;
                if (docFiles && docFiles.length > 0) {
                    setStatus({ type: 'success', message: "Uploading performance document..." });
                    data.result_doc_url = await uploadMedia(docFiles[0], 'perf_docs', ownerId);
                }
            }

            // 2. Clean UI-only props
            delete data.owner;
            delete data.trainer;
            delete data.horse;
            delete data.event;
            delete data.discipline;
            delete data.updated_at;

            let error;
            if (currentItem.id) {
                const { error: updateError } = await (supabase.from(table) as any).update(data).eq("id", currentItem.id);
                error = updateError;
            } else {
                const { error: insertError } = await (supabase.from(table) as any).insert([data]);
                error = insertError;
            }

            if (error) throw error;

            setStatus({ type: 'success', message: `${subTab === 'horses' ? 'Horse' : 'Performance'} saved successfully!` });
            setIsEditing(false);
            setCurrentItem(null);
            setMediaPreviews([]);
            fetchData();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, table: string) => {
        if (!confirm(`Are you sure you want to delete this ${table === 'horses' ? 'horse' : 'performance'}?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase.from(table).delete().eq("id", id);
            if (error) throw error;
            fetchData();
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTopPerformance = async (id: number, currentVal: boolean) => {
        try {
            const { error } = await (supabase.from("performances") as any)
                .update({ is_top_performance: !currentVal })
                .eq("id", id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'doc') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newPreviews = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            type
        }));
        setMediaPreviews(prev => [...prev.filter(p => p.type !== type), ...newPreviews]);
    };

    const openEdit = (item: any = null) => {
        if (item) {
            setCurrentItem({ ...item });
            if (item.image_url) setMediaPreviews([{ id: '1', url: item.image_url, type: 'image' }]);
        } else {
            setCurrentItem(subTab === 'horses' ? {
                name: '', breed: '', sex: 'Stallion', birth_year: new Date().getFullYear(),
                description: '', image_url: '', video_url: '', owner_id: profiles[0]?.id,
                is_for_sale: false, price: 0, has_pedigree: false
            } : {
                horse_id: horses[0]?.id, event_name: '', event_type: EVENT_TYPES[0],
                time_or_score: '', est_time: '', placing: 1, total_entries: 0,
                rodeo_contest: DIVISIONS[0], prize_money: 0, performance_date: new Date().toISOString().split('T')[0],
                country: 'USA', state: '', city: '', priority: 'Normal', discipline_id: disciplines[0]?.id
            });
            setMediaPreviews([]);
        }
        setIsEditing(true);
        setStatus(null);
    };

    const filteredHorses = horses.filter(h => h.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredPerfs = performances.filter(p => p.horse?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.event_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm font-medium transition-all shadow-sm";

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase flex items-center gap-3">
                        Horse Management
                    </h2>
                    <p className="text-gray-500 text-sm font-medium italic">Full control over athletes and results</p>
                </div>
                <div className="flex gap-2 bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => { setSubTab("horses"); setIsEditing(false); }}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === "horses" ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Horses
                    </button>
                    <button
                        onClick={() => { setSubTab("performances"); setIsEditing(false); }}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === "performances" ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Performances
                    </button>
                </div>
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <div className="flex items-center gap-3">
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-bold uppercase tracking-tight">{status.message}</p>
                    </div>
                    <button onClick={() => setStatus(null)}><X size={18} /></button>
                </div>
            )}

            {isEditing ? (
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm animate-in zoom-in-95 duration-200">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                {currentItem.id ? 'Edit' : 'New'} {subTab === "horses" ? 'Horse Profile' : 'Performance Record'}
                            </h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {subTab === "horses" ? (
                                <>
                                    {/* HORSE FORM - LEFT COLUMN */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Horse Name</label>
                                            <input
                                                type="text" required value={currentItem.name}
                                                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                                className={inputClass} placeholder="Enter horse name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Owner (Target Account)</label>
                                            <select
                                                required value={currentItem.owner_id || ""}
                                                onChange={(e) => setCurrentItem({ ...currentItem, owner_id: e.target.value })}
                                                className={inputClass}
                                            >
                                                {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date of Birth</label>
                                            <input
                                                type="date" value={currentItem.birth_date || ""}
                                                onChange={(e) => setCurrentItem({ ...currentItem, birth_date: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 py-2">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox" className="sr-only peer"
                                                    checked={currentItem.has_pedigree}
                                                    onChange={(e) => setCurrentItem({ ...currentItem, has_pedigree: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                                                <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Has Pedigree</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* HORSE FORM - RIGHT COLUMN (MEDIA) */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pictures</label>
                                            <div
                                                onClick={() => document.getElementById('picture-upload')?.click()}
                                                className="border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50/40 transition-all mb-4"
                                            >
                                                <p className="text-sm font-bold text-blue-900 mb-1">Drop images here or click to upload</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Upload only image files (jpg, png, gif, max 10MB)</p>
                                                <input id="picture-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                                                {mediaPreviews.find(p => p.type === 'image') && <p className="text-xs text-green-600 mt-2 font-black uppercase">Ready for upload!</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Videos (Optional)</label>
                                            <div
                                                onClick={() => document.getElementById('video-upload')?.click()}
                                                className="border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50/40 transition-all"
                                            >
                                                <p className="text-sm font-bold text-blue-900 mb-1">Drop videos here or click to upload</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Upload only video files (mp4, avi, mov, max 10MB)</p>
                                                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                                                {mediaPreviews.find(p => p.type === 'video') && <p className="text-xs text-green-600 mt-2 font-black uppercase">Ready for upload!</p>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* PERFORMANCE FORM - LEFT COLUMN */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Horse *</label>
                                                <select required value={currentItem.horse_id || ""} onChange={(e) => setCurrentItem({ ...currentItem, horse_id: parseInt(e.target.value) })} className={inputClass}>
                                                    {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Event Name</label>
                                                <input type="text" value={currentItem.event_name} onChange={(e) => setCurrentItem({ ...currentItem, event_name: e.target.value })} className={inputClass} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Event Type</label>
                                                <select value={currentItem.event_type} onChange={(e) => setCurrentItem({ ...currentItem, event_type: e.target.value })} className={inputClass}>
                                                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Discipline *</label>
                                                <select required value={currentItem.discipline_id || ""} onChange={(e) => setCurrentItem({ ...currentItem, discipline_id: parseInt(e.target.value) })} className={inputClass}>
                                                    <option value="">Select Discipline</option>
                                                    {disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time (in seconds)</label>
                                                <input type="text" value={currentItem.time_or_score} onChange={(e) => setCurrentItem({ ...currentItem, time_or_score: e.target.value })} className={inputClass} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Est Time (For place time)</label>
                                                <input type="text" value={currentItem.est_time} onChange={(e) => setCurrentItem({ ...currentItem, est_time: e.target.value })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Placing</label>
                                                <input type="number" value={currentItem.placing} onChange={(e) => setCurrentItem({ ...currentItem, placing: parseInt(e.target.value) })} className={inputClass} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Entries</label>
                                                <input type="number" value={currentItem.total_entries} onChange={(e) => setCurrentItem({ ...currentItem, total_entries: parseInt(e.target.value) })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Division (Contest)</label>
                                                <select value={currentItem.rodeo_contest} onChange={(e) => setCurrentItem({ ...currentItem, rodeo_contest: e.target.value })} className={inputClass}>
                                                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Earnings ($)</label>
                                                <input type="number" step="0.01" value={currentItem.prize_money} onChange={(e) => setCurrentItem({ ...currentItem, prize_money: parseFloat(e.target.value) })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Performance Date</label>
                                                <input type="date" value={currentItem.performance_date} onChange={(e) => setCurrentItem({ ...currentItem, performance_date: e.target.value })} className={inputClass} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* PERFORMANCE FORM - RIGHT COLUMN */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Country</label>
                                                <select value={currentItem.country} onChange={(e) => setCurrentItem({ ...currentItem, country: e.target.value })} className={inputClass}>
                                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">State</label>
                                                <select value={currentItem.state} onChange={(e) => setCurrentItem({ ...currentItem, state: e.target.value })} className={inputClass}>
                                                    <option value="">Select State</option>
                                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                                                <input type="text" value={currentItem.city} onChange={(e) => setCurrentItem({ ...currentItem, city: e.target.value })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                                                <select value={currentItem.priority} onChange={(e) => setCurrentItem({ ...currentItem, priority: e.target.value })} className={inputClass}>
                                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Video (Source)</label>
                                            <div onClick={() => document.getElementById('perf-video-upload')?.click()} className="border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-50/40 transition-all">
                                                <p className="text-sm font-bold text-blue-900 mb-1">Drop a video here or click to upload</p>
                                                <input id="perf-video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                                                {mediaPreviews.find(p => p.type === 'video') && <p className="text-xs text-green-600 mt-2 font-black">Video Attached</p>}
                                            </div>
                                            <input type="text" placeholder="Paste video URL (optional)" value={currentItem.video_url} onChange={(e) => setCurrentItem({ ...currentItem, video_url: e.target.value })} className={`${inputClass} mt-2`} />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Performance Award/Document</label>
                                            <div onClick={() => document.getElementById('perf-doc-upload')?.click()} className="border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-50/40 transition-all">
                                                <p className="text-sm font-bold text-blue-900 mb-1">Drop document here or click to upload</p>
                                                <input id="perf-doc-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'doc')} />
                                                {mediaPreviews.find(p => p.type === 'doc') && <p className="text-xs text-green-600 mt-2 font-black">Document Attached</p>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100">
                            <button
                                type="submit" disabled={loading}
                                className="flex-1 bg-gray-900 border border-transparent text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {currentItem.id ? 'Save Changes' : `Confirm ${subTab === 'horses' ? 'Horse' : 'Performance'}`}
                            </button>
                            <button
                                type="button" onClick={() => setIsEditing(false)}
                                className="px-8 py-4 bg-white border border-gray-100 text-gray-400 font-extrabold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-50 transition-all hover:text-gray-900 shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3 w-72">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text" placeholder={`Search ${subTab === 'horses' ? 'horses' : 'performances'}...`}
                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-full placeholder:text-gray-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => openEdit()}
                            className="bg-[var(--color-primary)] hover:bg-[#d98d1f] text-white font-black uppercase text-[10px] tracking-widest py-3 px-6 rounded-2xl transition-all shadow-lg shadow-orange-900/10 flex items-center gap-2"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Add {subTab === "horses" ? 'Horse' : 'Performance'}
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden text-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    {subTab === "horses" ? (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horse Info</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ownership</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event / Horse</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Result</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Top <br /> Performances</th>
                                        </>
                                    )}
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && (subTab === 'horses' ? horses : performances).length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-[10px] tracking-widest">Initializing Module...</td></tr>
                                ) : (subTab === 'horses' ? filteredHorses : filteredPerfs).length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-xs">No records found</td></tr>
                                ) : (subTab === 'horses' ? filteredHorses : filteredPerfs).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            {subTab === "horses" ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm">
                                                        {item.image_url ? <Image src={item.image_url} alt={item.name} fill className="object-cover" /> : <Activity size={24} className="m-auto mt-4 text-gray-200" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 uppercase tracking-tight text-base leading-tight">{item.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.breed} • {item.sex}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase tracking-tight text-sm leading-tight">{item.event_name || 'N/A'}</p>
                                                    <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                        <Activity size={10} strokeWidth={3} /> {item.horse?.name} • {item.discipline?.name || 'No Discipline'}
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {subTab === "horses" ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs font-black text-gray-600 uppercase tracking-tight">
                                                        <User size={12} className="text-gray-300" /> {item.owner?.full_name || 'N/A'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time/Score</span>
                                                        <span className="font-black text-gray-800 font-mono text-base">{item.time_or_score || '-'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Place</span>
                                                        <span className={`px-2 py-0.5 rounded-lg font-black text-[12px] text-center ${item.placing === 1 ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>{item.placing}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {subTab === "horses" ? (
                                                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] ${item.is_for_sale ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                    {item.is_for_sale ? 'Available for Sale' : 'Private'}
                                                </span>
                                            ) : (
                                                <span className="font-black text-green-600 text-base">${item.prize_money?.toLocaleString()}</span>
                                            )}
                                        </td>
                                        {subTab === "performances" && (
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => handleToggleTopPerformance(item.id, !!item.is_top_performance)}
                                                    className={`w-12 h-6 rounded-full transition-all relative mx-auto ${item.is_top_performance ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${item.is_top_performance ? 'translate-x-[24px]' : ''}`} />
                                                </button>
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-3 text-gray-300 hover:text-[var(--color-primary)] hover:bg-orange-50 rounded-xl transition-all duration-200"
                                                >
                                                    <Edit2 size={16} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, subTab)}
                                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
