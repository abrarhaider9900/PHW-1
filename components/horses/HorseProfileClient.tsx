"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    Share2, 
    UserPlus, 
    Flag, 
    PlusCircle, 
    Edit, 
    GitBranch, 
    Printer, 
    ChevronRight,
    Play
} from "lucide-react";
import { formatMoney, horseHeadline } from "@/utils/format";
import { getEmbedUrl } from "@/utils/video";

interface HorseProfileClientProps {
    horse: any;
    performances: any[];
    isLoggedIn: boolean;
    viewerRole: string | null;
    canOwnerView: boolean;
}

export default function HorseProfileClient({
    horse,
    performances,
    isLoggedIn,
    viewerRole,
    canOwnerView
}: HorseProfileClientProps) {
    const [viewType, setViewType] = useState<"public" | "owner">(
        canOwnerView ? "owner" : "public"
    );
    const [activeDiscipline, setActiveDiscipline] = useState<string | null>(
        performances[0]?.discipline?.name || null
    );

    const totalLTE = performances.reduce((sum, p) => sum + (p.prize_money || 0), 0);
    const disciplines = Array.from(new Set(performances.map(p => p.discipline?.name).filter(Boolean)));
    const latestPerf = performances[0];

    const btnBase = "px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border shadow-sm";
    const primaryBtn = `${btnBase} bg-[#8b3d24] text-white border-[#8b3d24] hover:bg-[#a64a2b]`;
    const outlineBtn = `${btnBase} bg-white text-gray-600 border-gray-200 hover:bg-gray-50`;
    
    const ownerToggleBtn = (type: 'owner' | 'public') => (
        <button 
            onClick={() => setViewType(type)}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${
                viewType === type 
                ? 'bg-[#8b3d24] text-white shadow-md' 
                : 'bg-[#e5e1d8] text-gray-500 hover:bg-[#d8d4cb]'
            }`}
        >
            {type === 'owner' ? 'Owner View' : 'Public View'}
        </button>
    );

    return (
        <div style={{ background: "#f8f7f2", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container" style={{ maxWidth: "1200px" }}>
                
                {/* View Toggle (Only for Admin / Horse Owner) */}
                {canOwnerView && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "40px" }}>
                        {ownerToggleBtn('owner')}
                        {ownerToggleBtn('public')}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "60px" }}>
                    {/* Media Section */}
                    <div>
                        <div style={{ 
                            position: "relative", 
                            width: "100%", 
                            aspectRatio: "3/2", 
                            borderRadius: "16px", 
                            overflow: "hidden", 
                            border: "1px solid #e4e4e4",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                        }}>
                            <Image 
                                src={horse.image_url || "/images/placeholder.jpg"} 
                                alt={horse.name} 
                                fill 
                                style={{ objectFit: "cover" }} 
                            />
                        </div>
                        {/* Thumbnails */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                            <div style={{ width: "60px", height: "45px", position: "relative", borderRadius: "4px", overflow: "hidden", border: "2px solid #8b3d24" }}>
                                <Image src={horse.image_url || "/images/placeholder.jpg"} fill style={{ objectFit: "cover" }} alt="thumb" />
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#141414", marginBottom: "5px" }}>{horse.name}</h1>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "#8b3d24", marginBottom: "15px" }}>
                            LTE: {formatMoney(totalLTE)}
                        </p>
                        
                        <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8", marginBottom: "30px" }}>
                            <p>{horseHeadline(horse.color || horse.breed, horse.sex, horse.birth_year, horse.registry)}</p>
                            <p><strong>Owner:</strong> <span style={{ color: "#8b3d24" }}>{horse.owner?.full_name}</span></p>
                            <p><strong>Trainer:</strong> <span style={{ color: "#8b3d24" }}>{horse.trainer?.name}</span></p>
                            <p><strong>Pedigree:</strong> <span style={{ color: "#8b3d24" }}>{[horse.sire, horse.dam].filter(Boolean).join(" x ") || "N/A"}</span></p>
                        </div>

                        {/* Public Actions */}
                        {viewType === "public" && (
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "25px" }}>
                                <button className={outlineBtn}><Share2 size={16} /> Share</button>
                                <button className={outlineBtn}><UserPlus size={16} /> Follow</button>
                                <button className={outlineBtn}><Flag size={16} /> Report</button>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                            {viewType === "public" ? (
                                <>
                                    <button className={primaryBtn}>View Pedigree</button>
                                    <button className={primaryBtn}>Print Stats</button>
                                    <button className={primaryBtn}>Share Horse</button>
                                </>
                            ) : (
                                <>
                                    <button className={primaryBtn}><PlusCircle size={18} /> Add Performance</button>
                                    <button className={primaryBtn}><Edit size={18} /> Edit Profile</button>
                                    <button className={primaryBtn}><GitBranch size={18} /> Pedigree (Link to Pedigree/Add)</button>
                                    <button className={primaryBtn}><Printer size={18} /> Print Stats</button>
                                    <button className={primaryBtn}><Share2 size={18} /> Share Horse</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Disciplines */}
                <div style={{ marginBottom: "50px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#141414", textTransform: "uppercase", marginBottom: "20px" }}>Disciplines</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {disciplines.length > 0 ? disciplines.map(d => (
                            <button 
                                key={d}
                                onClick={() => setActiveDiscipline(d)}
                                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                                    activeDiscipline === d 
                                    ? 'bg-[#8b3d24] text-white' 
                                    : 'bg-[#e5e1d8] text-gray-500'
                                }`}
                            >
                                {d}
                            </button>
                        )) : (
                            <p style={{ color: "#999", fontSize: "14px" }}>No disciplines recorded.</p>
                        )}
                    </div>
                </div>

                {/* Latest Video */}
                <div style={{ marginBottom: "60px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#141414", textTransform: "uppercase", marginBottom: "20px" }}>Latest Performance Video</h3>
                    <div style={{ 
                        background: "#fff", 
                        borderRadius: "24px", 
                        padding: "30px", 
                        border: "1px solid #e4e4e4",
                        textAlign: "center"
                    }}>
                        {latestPerf?.video_url ? (
                            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "16px" }}>
                                <iframe
                                    src={getEmbedUrl(latestPerf.video_url)}
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div style={{ padding: "40px", color: "#999" }}>
                                <Play size={48} strokeWidth={1} style={{ margin: "0 auto 15px", opacity: 0.3 }} />
                                <p>No video available for the latest performance.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Stats */}
                <div style={{ marginBottom: "60px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#141414", textTransform: "uppercase", marginBottom: "20px" }}>Performance Stats</h3>
                    <div style={{ 
                        background: "#fff", 
                        borderRadius: "24px", 
                        overflow: "hidden", 
                        border: "1px solid #e4e4e4",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#fcfcfb", borderBottom: "1px solid #f0f0f0" }}>
                                    <th style={{ padding: "20px", textAlign: "left", fontSize: "12px", color: "#999", fontWeight: "800", textTransform: "uppercase" }}>Date</th>
                                    <th style={{ padding: "20px", textAlign: "left", fontSize: "12px", color: "#999", fontWeight: "800", textTransform: "uppercase" }}>Location</th>
                                    <th style={{ padding: "20px", textAlign: "left", fontSize: "12px", color: "#999", fontWeight: "800", textTransform: "uppercase" }}>Placing</th>
                                    <th style={{ padding: "20px", textAlign: "left", fontSize: "12px", color: "#999", fontWeight: "800", textTransform: "uppercase" }}>Earnings</th>
                                    <th style={{ padding: "20px", textAlign: "right", fontSize: "12px", color: "#999", fontWeight: "800", textTransform: "uppercase" }}>More Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {performances.length > 0 ? performances.map((perf) => (
                                    <tr key={perf.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td style={{ padding: "20px", fontSize: "14px", fontWeight: "700", color: "#141414" }}>
                                            {perf.performance_date ? new Date(perf.performance_date).toISOString().split('T')[0] : 'N/A'}
                                        </td>
                                        <td style={{ padding: "20px", fontSize: "14px", color: "#666" }}>
                                            {perf.city && perf.state ? `${perf.city}, ${perf.state}` : (perf.city || perf.state || 'N/A')}
                                        </td>
                                        <td style={{ padding: "20px", fontSize: "14px", color: "#141414", fontWeight: "700" }}>
                                            {perf.placing === 1 ? '1st' : perf.placing === 2 ? '2nd' : perf.placing === 3 ? '3rd' : `${perf.placing}th`}
                                        </td>
                                        <td style={{ padding: "20px", fontSize: "14px", color: "#141414", fontWeight: "700" }}>
                                            {formatMoney(perf.prize_money)}
                                        </td>
                                        <td style={{ padding: "20px", textAlign: "right", fontSize: "14px" }}>
                                            <Link href={`/performances/${perf.id}`} style={{ color: "#8b3d24", fontWeight: "800", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                                                More Details <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#999" }}>No performance data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
