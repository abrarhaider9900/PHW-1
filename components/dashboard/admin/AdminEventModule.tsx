"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit2,
    Trash2,
    Calendar,
    MapPin,
    Search,
    X,
    Check,
    ChevronDown,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import Image from "next/image";

export default function AdminEventModule() {
    const supabase = createClient();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        venue: "",
        city: "",
        state: "",
        country: "USA",
        date: new Date().toISOString().split('T')[0],
        description: "",
        image_url: ""
    });

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true });

        if (!error && data) {
            setEvents(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `event-thumbnails/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('events')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                alert(`Upload failed: ${uploadError.message}. Ensure you have an 'events' bucket in Supabase Storage with public access.`);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('events')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSave = async (id?: number) => {
        if (!formData.name || !formData.date) return;
        setUploading(true);

        let finalImageUrl = formData.image_url;

        if (selectedFile) {
            const uploadedUrl = await uploadImage(selectedFile);
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            }
        }

        const dataToSave = { ...formData, image_url: finalImageUrl };

        if (id || editingId) {
            const targetId = id || editingId;
            const { error } = await (supabase.from("events") as any).update(dataToSave).eq("id", targetId);
            if (!error) {
                setEditingId(null);
                resetForm();
                fetchEvents();
            }
        } else {
            const { error } = await (supabase.from("events") as any).insert([dataToSave]);
            if (!error) {
                setIsAdding(false);
                resetForm();
                fetchEvents();
            }
        }
        setUploading(false);
    };

    const resetForm = () => {
        setFormData({
            name: "", venue: "", city: "", state: "", country: "USA",
            date: new Date().toISOString().split('T')[0], description: "", image_url: ""
        });
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this event? This will not delete performance records but they may lose their link.")) return;
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (!error) fetchEvents();
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase">Events Management</h2>
                    <p className="text-gray-500 text-sm font-medium">Schedule and manage equine competitions</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl shadow-lg shadow-orange-900/20 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all"
                >
                    <Plus size={18} />
                    Create Event
                </button>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Info</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(isAdding || editingId) && (
                            <tr className="bg-orange-50/30">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-4">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-orange-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-orange-50 transition-all overflow-hidden relative group"
                                        >
                                            {filePreview || formData.image_url ? (
                                                <>
                                                    <Image src={filePreview || formData.image_url} alt="Preview" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Upload size={20} className="text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon size={24} className="text-orange-200 mb-1" />
                                                    <span className="text-[8px] font-black text-orange-300 uppercase">Upload</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold shadow-sm outline-none"
                                                placeholder="Event Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold shadow-sm outline-none text-[10px]"
                                                placeholder="Or paste Image URL"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold shadow-sm outline-none"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text" placeholder="Venue"
                                            className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold shadow-sm outline-none"
                                            value={formData.venue}
                                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="text" placeholder="City"
                                                className="w-1/2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold shadow-sm outline-none"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                            <input
                                                type="text" placeholder="State"
                                                className="w-1/2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold shadow-sm outline-none"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            disabled={uploading}
                                            onClick={() => handleSave()}
                                            className="p-2 bg-green-500 text-white rounded-lg hover:scale-110 transition-transform disabled:opacity-50"
                                        >
                                            {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Check size={18} />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAdding(false);
                                                setEditingId(null);
                                                resetForm();
                                            }}
                                            className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:scale-110 transition-transform"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Loading Events...</td></tr>
                        ) : events.length === 0 && !isAdding ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No scheduled events</td></tr>
                        ) : (
                            events.map((event) => (
                                editingId === event.id ? null : (
                                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 relative bg-gray-50 flex-shrink-0">
                                                    {event.image_url ? (
                                                        <Image src={event.image_url} alt={event.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Calendar size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{event.name}</p>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{event.venue || 'TBA'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-black text-gray-500 uppercase">
                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                <MapPin size={14} className="text-gray-300" />
                                                {event.city}, {event.state}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(event.id);
                                                        setFormData({
                                                            name: event.name,
                                                            venue: event.venue || "",
                                                            city: event.city || "",
                                                            state: event.state || "",
                                                            country: event.country || "USA",
                                                            date: event.date,
                                                            description: event.description || "",
                                                            image_url: event.image_url || ""
                                                        });
                                                        setFilePreview(null);
                                                        setSelectedFile(null);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-orange-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
