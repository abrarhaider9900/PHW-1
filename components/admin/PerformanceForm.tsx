"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Performance, Horse } from "@/types/database";

interface PerformanceFormProps {
    performance?: Performance;
    redirectPath?: string;
}

const EVENT_TYPES = [
    "Rodeo",
    "Futurity",
    "Derby",
    "Classic",
    "Jackpot",
    "Show",
    "Exhibition",
    "Other",
];

const DIVISIONS = [
    "Open",
    "Youth",
    "Amateur",
    "Non-Pro",
    "Novice",
    "Limited",
    "Beginner",
    "Masters",
    "Senior",
    "Ladies",
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

export default function PerformanceForm({ performance, redirectPath = "/admin/performances" }: PerformanceFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!performance;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [horses, setHorses] = useState<Horse[]>([]);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [videoFileName, setVideoFileName] = useState("");
    const [docFileName, setDocFileName] = useState("");

    const [formData, setFormData] = useState({
        horse_id: performance?.horse_id?.toString() || "",
        event_name: performance?.event_name || "",
        event_type: performance?.event_type || "",
        time_or_score: performance?.time_or_score || "",
        est_time: performance?.est_time || "",
        placing: performance?.placing?.toString() || "",
        total_entries: performance?.total_entries?.toString() || "",
        rodeo_contest: performance?.rodeo_contest || "",
        prize_money: performance?.prize_money?.toString() || "",
        performance_date: performance?.performance_date || "",
        country: performance?.country || "",
        state: performance?.state || "",
        city: performance?.city || "",
        priority: performance?.priority || "",
        video_url: performance?.video_url || "",
        result_doc_url: performance?.result_doc_url || "",
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase.from("horses").select("id, name").order("name");
            if (data) setHorses(data as any);
        };
        fetchData();
    }, [supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const dataToSave: any = {
            horse_id: parseInt(formData.horse_id),
            event_name: formData.event_name || null,
            event_type: formData.event_type || null,
            time_or_score: formData.time_or_score || null,
            est_time: formData.est_time || null,
            placing: formData.placing ? parseInt(formData.placing) : null,
            total_entries: formData.total_entries ? parseInt(formData.total_entries) : null,
            rodeo_contest: formData.rodeo_contest || null,
            prize_money: formData.prize_money ? parseFloat(formData.prize_money) : null,
            performance_date: formData.performance_date || null,
            country: formData.country || null,
            state: formData.state || null,
            city: formData.city || null,
            priority: formData.priority || null,
            video_url: formData.video_url || null,
            result_doc_url: formData.result_doc_url || null,
        };

        let res;
        if (isEdit) {
            res = await (supabase.from("performances") as any).update(dataToSave).eq("id", performance!.id);
        } else {
            res = await (supabase.from("performances") as any).insert([dataToSave]);
        }

        if (res.error) {
            setError(res.error.message);
            setLoading(false);
        } else {
            router.push(redirectPath);
            router.refresh();
        }
    };

    const handleFileDrop = (e: React.DragEvent, field: "video_url" | "result_doc_url") => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (field === "video_url") setVideoFileName(file.name);
            else setDocFileName(file.name);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "video_url" | "result_doc_url") => {
        const file = e.target.files?.[0];
        if (file) {
            if (field === "video_url") setVideoFileName(file.name);
            else setDocFileName(file.name);
        }
    };

    // Styles matching the original site
    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "12px",
        fontWeight: 500,
        color: "#666",
        marginBottom: "4px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        color: "#333",
        backgroundColor: "#fff",
        outline: "none",
        boxSizing: "border-box",
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        appearance: "auto" as any,
        color: "#888",
    };

    const fieldGroupStyle: React.CSSProperties = {
        marginBottom: "16px",
    };

    const dropzoneStyle: React.CSSProperties = {
        border: "2px dashed #90caf9",
        borderRadius: "6px",
        padding: "24px",
        textAlign: "center",
        color: "#90caf9",
        fontSize: "13px",
        cursor: "pointer",
        backgroundColor: "rgba(144, 202, 249, 0.04)",
        transition: "border-color 0.2s, background-color 0.2s",
    };

    return (
        <div style={{
            maxWidth: "680px",
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}>
            <h2 style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#333",
                marginBottom: "24px",
                borderBottom: "1px solid #eee",
                paddingBottom: "12px",
            }}>
                {isEdit ? "Edit Horse Performance" : "Add Horse Performance"}
            </h2>

            <button
                type="button"
                onClick={() => router.back()}
                style={{
                    display: "inline-block",
                    marginBottom: "20px",
                    padding: "6px 16px",
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 500,
                }}
            >
                ‹ BACK TO LIST
            </button>

            {error && (
                <div style={{
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.25)",
                    color: "#d32f2f",
                    padding: "12px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                    fontSize: "13px",
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Horse */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Horse</label>
                    <select
                        name="horse_id"
                        value={formData.horse_id}
                        onChange={handleChange}
                        style={selectStyle}
                        required
                    >
                        <option value="">Select Horse</option>
                        {horses.map((h) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </div>

                {/* Event Name */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Event Name</label>
                    <input
                        name="event_name"
                        value={formData.event_name}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder=""
                    />
                </div>

                {/* Event Type */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Event Type</label>
                    <select
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        <option value="">Select Event Type</option>
                        {EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Time (in seconds) */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Time (in seconds)</label>
                    <input
                        name="time_or_score"
                        value={formData.time_or_score}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder=""
                    />
                </div>

                {/* Est Time */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Est Time (For place time in seconds)</label>
                    <input
                        name="est_time"
                        value={formData.est_time}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder=""
                    />
                </div>

                {/* Placing */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Placing</label>
                    <input
                        type="number"
                        name="placing"
                        value={formData.placing}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>

                {/* Total Entries */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Total Entries</label>
                    <input
                        type="number"
                        name="total_entries"
                        value={formData.total_entries}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>

                {/* Division (Contest) */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Division (Contest)</label>
                    <select
                        name="rodeo_contest"
                        value={formData.rodeo_contest}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        <option value="">Select Division</option>
                        {DIVISIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Earnings ($) */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Earnings ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="prize_money"
                        value={formData.prize_money}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder=""
                    />
                </div>

                {/* Performance Date */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Performance Date</label>
                    <input
                        type="date"
                        name="performance_date"
                        value={formData.performance_date}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>

                {/* Country */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Country</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        <option value="">Select Country</option>
                        {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* State */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>State</label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        <option value="">Select State</option>
                        {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* City */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>City</label>
                    <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Select City"
                    />
                </div>

                {/* Priority */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Priority</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        <option value="">Select Priority</option>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* Video (Source) – Dropzone */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Video (Source)</label>
                    <div
                        style={dropzoneStyle}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleFileDrop(e, "video_url")}
                        onClick={() => videoInputRef.current?.click()}
                    >
                        {videoFileName
                            ? <span style={{ color: "#333" }}>{videoFileName}</span>
                            : "Drop a video here or click to upload"
                        }
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileSelect(e, "video_url")}
                        />
                    </div>
                    <div style={{ marginTop: "8px" }}>
                        <input
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Paste video URL (optional)"
                        />
                    </div>
                </div>

                {/* Performance Award/Document – Dropzone */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Performance Award/Document</label>
                    <div
                        style={dropzoneStyle}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleFileDrop(e, "result_doc_url")}
                        onClick={() => docInputRef.current?.click()}
                    >
                        {docFileName
                            ? <span style={{ color: "#333" }}>{docFileName}</span>
                            : "Drop document here or click to upload"
                        }
                        <input
                            ref={docInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileSelect(e, "result_doc_url")}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: "28px" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            opacity: loading ? 0.7 : 1,
                            transition: "opacity 0.2s",
                        }}
                    >
                        {loading ? "Saving..." : isEdit ? "UPDATE PERFORMANCE" : "ADD HORSE PERFORMANCE"}
                    </button>
                </div>
            </form>
        </div>
    );
}
