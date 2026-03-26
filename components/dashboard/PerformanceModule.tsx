"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Performance, Horse, Event, Discipline } from "@/types/database";
import { Plus, Edit2, Trash2, Save, X, Loader2, TrendingUp, Search, CheckCircle2, AlertCircle, Calendar, Trophy, DollarSign } from "lucide-react";

interface PerformanceModuleProps {
    user: any;
}

const EVENT_TYPES = [
    "Rodeo", "Futurity", "Derby", "Classic", "Jackpot", "Show", "Exhibition", "Other",
];

const DIVISIONS = [
    "Open", "Youth", "Amateur", "Non-Pro", "Novice", "Limited", "Beginner", "Masters", "Senior", "Ladies",
];

const PRIORITIES = ["High", "Medium", "Low"];

const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming",
];

const COUNTRIES = ["USA", "Canada", "Mexico", "Australia", "Brazil", "Other"];

export default function PerformanceModule({ user }: PerformanceModuleProps) {
    const supabase = createClient();
    const [performances, setPerformances] = useState<Performance[]>([]);
    const [horses, setHorses] = useState<Horse[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPerf, setCurrentPerf] = useState<any>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [videoFileName, setVideoFileName] = useState("");
    const [docFileName, setDocFileName] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch user's horses
            const { data: horsesData } = await supabase
                .from("horses")
                .select("id, name")
                .eq("owner_id", user.id);
            setHorses(horsesData || []);

            if (horsesData && horsesData.length > 0) {
                const horseIds = horsesData.map((h: any) => h.id);
                // 2. Fetch performances for these horses
                const { data: perfData, error: perfError } = await supabase
                    .from("performances")
                    .select("*, horse:horses(name), event:events(name, date), discipline:disciplines(name)")
                    .in("horse_id", horseIds)
                    .order("created_at", { ascending: false });

                if (perfError) throw perfError;
                setPerformances(perfData || []);
            }

            // 3. Fetch events
            const { data: eventsData } = await supabase.from("events").select("id, name, date").order("date", { ascending: false });
            setEvents(eventsData || []);

            // 4. Fetch disciplines
            const { data: discData } = await supabase.from("disciplines").select("id, name").order("name");
            setDisciplines(discData || []);

        } catch (error: any) {
            console.error("Error fetching performance data:", error.message);
        } finally {
            setLoading(false);
        }
    }, [supabase, user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const perfData = { ...currentPerf };

            // Clean up UI-only properties
            delete perfData.horse;
            delete perfData.event;
            delete perfData.discipline;
            delete perfData.updated_at;

            let error;
            if (currentPerf.id) {
                const { error: updateError } = await (supabase.from("performances") as any).update(perfData).eq("id", currentPerf.id);
                error = updateError;
            } else {
                const { error: insertError } = await (supabase.from("performances") as any).insert([perfData]);
                error = insertError;
            }

            if (error) throw error;

            setStatus({ type: 'success', message: `Performance ${currentPerf.id ? 'updated' : 'added'} successfully!` });
            setIsEditing(false);
            setCurrentPerf(null);
            setVideoFileName("");
            setDocFileName("");
            fetchData();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this performance record?")) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("performances").delete().eq("id", id);
            if (error) throw error;
            setStatus({ type: 'success', message: "Performance deleted successfully!" });
            fetchData();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (perf: any = null) => {
        setCurrentPerf(perf || {
            horse_id: horses[0]?.id || null,
            event_name: "",
            event_type: "",
            time_or_score: "",
            est_time: "",
            placing: "",
            total_entries: "",
            rodeo_contest: "",
            prize_money: "",
            performance_date: "",
            country: "",
            state: "",
            city: "",
            priority: "",
            video_url: "",
            result_doc_url: "",
        });
        setIsEditing(true);
        setStatus(null);
        setVideoFileName("");
        setDocFileName("");
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition-all outline-none text-sm";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Performance Records</h2>
                    <p className="text-sm text-gray-500">Track scores, times, and earnings for your horses.</p>
                </div>
                {!isEditing && horses.length > 0 && (
                    <button
                        onClick={() => openEdit()}
                        className="bg-[var(--color-primary)] hover:bg-[#d98d1f] text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-100"
                    >
                        <Plus size={18} />
                        Log Performance
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
                            <h3 className="text-lg font-bold text-gray-800">{currentPerf.id ? 'Edit Record' : 'Log New Performance'}</h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Row 1: Horse + Event Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Horse *</label>
                                <select
                                    required
                                    value={currentPerf.horse_id || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, horse_id: parseInt(e.target.value) })}
                                    className={inputClass}
                                >
                                    <option value="" disabled>Select Horse</option>
                                    {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Event Name</label>
                                <input
                                    type="text"
                                    value={currentPerf.event_name || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, event_name: e.target.value })}
                                    className={inputClass}
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/* Row 2: Event Type + Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Event Type</label>
                                <select
                                    value={currentPerf.event_type || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, event_type: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select Event Type</option>
                                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Time (in seconds)</label>
                                <input
                                    type="text"
                                    value={currentPerf.time_or_score || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, time_or_score: e.target.value })}
                                    className={inputClass}
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/* Row 3: Est Time + Placing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Est Time (For place time in seconds)</label>
                                <input
                                    type="text"
                                    value={currentPerf.est_time || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, est_time: e.target.value })}
                                    className={inputClass}
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Placing</label>
                                <input
                                    type="number"
                                    value={currentPerf.placing || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, placing: e.target.value ? parseInt(e.target.value) : "" })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Row 4: Total Entries + Division */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Total Entries</label>
                                <input
                                    type="number"
                                    value={currentPerf.total_entries || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, total_entries: e.target.value ? parseInt(e.target.value) : "" })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Division (Contest)</label>
                                <select
                                    value={currentPerf.rodeo_contest || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, rodeo_contest: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select Division</option>
                                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 5: Earnings + Performance Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Earnings ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentPerf.prize_money || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, prize_money: e.target.value ? parseFloat(e.target.value) : "" })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Performance Date</label>
                                <input
                                    type="date"
                                    value={currentPerf.performance_date || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, performance_date: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Row 6: Country + State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Country</label>
                                <select
                                    value={currentPerf.country || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, country: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select Country</option>
                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">State</label>
                                <select
                                    value={currentPerf.state || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, state: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 7: City + Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">City</label>
                                <input
                                    type="text"
                                    value={currentPerf.city || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, city: e.target.value })}
                                    className={inputClass}
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Priority</label>
                                <select
                                    value={currentPerf.priority || ""}
                                    onChange={(e) => setCurrentPerf({ ...currentPerf, priority: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select Priority</option>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Video Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Video (Source)</label>
                            <div
                                className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) setVideoFileName(file.name);
                                }}
                                onClick={() => videoInputRef.current?.click()}
                            >
                                {videoFileName
                                    ? <span className="text-sm text-gray-700 font-medium">{videoFileName}</span>
                                    : <span className="text-sm text-blue-400">Drop a video here or click to upload</span>
                                }
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setVideoFileName(file.name);
                                    }}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Paste video URL (optional)"
                                value={currentPerf.video_url || ""}
                                onChange={(e) => setCurrentPerf({ ...currentPerf, video_url: e.target.value })}
                                className={`${inputClass} mt-2`}
                            />
                        </div>

                        {/* Document Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Performance Award/Document</label>
                            <div
                                className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) setDocFileName(file.name);
                                }}
                                onClick={() => docInputRef.current?.click()}
                            >
                                {docFileName
                                    ? <span className="text-sm text-gray-700 font-medium">{docFileName}</span>
                                    : <span className="text-sm text-blue-400">Drop document here or click to upload</span>
                                }
                                <input
                                    ref={docInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setDocFileName(file.name);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-100 uppercase tracking-wide text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {currentPerf.id ? 'Update Performance' : 'Add Horse Performance'}
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
                </div >
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Horse</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Division</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Score/Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Place</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Earnings</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && performances.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : performances.length > 0 ? (
                                    performances.map((perf) => (
                                        <tr key={perf.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-800">{perf.horse?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="font-semibold">{perf.event_name || perf.event?.name}</div>
                                                <div className="text-[10px] text-gray-400">{perf.performance_date || perf.event?.date}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{perf.rodeo_contest || perf.discipline?.name}</td>
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-gray-700 text-center">{perf.time_or_score}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${perf.placing === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                    perf.placing === 2 ? 'bg-gray-200 text-gray-700' :
                                                        perf.placing === 3 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-50 text-gray-500'
                                                    }`}>
                                                    {perf.placing}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">${perf.prize_money?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(perf)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(perf.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Trophy size={40} className="text-gray-200 mb-3" />
                                                <p className="text-gray-500 font-medium">No performance records found.</p>
                                                {horses.length === 0 && (
                                                    <p className="text-xs text-gray-400 mt-2 italic">You need to add a horse before you can log performances.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }
        </div >
    );
}
