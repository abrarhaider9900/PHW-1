"use client";

import { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard,
    Users,
    Folders,
    UserSquare2,
    ClipboardList,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    LogOut,
    Activity
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

import AdminUserModule from "./admin/AdminUserModule";
import AdminDisciplineModule from "./admin/AdminDisciplineModule";
import AdminProfileModule from "./admin/AdminProfileModule";
import AdminHorseModule from "./admin/AdminHorseModule";
import AdminEventModule from "./admin/AdminEventModule";

interface DashboardStats {
    totalUsers: number;
    activeHorses: number;
    liveEvents: number;
    totalDisciplines: number;
}

interface ActivityItem {
    id: string | number;
    title: string;
    type: string;
    time: string;
    status: string;
}

const AdminOverview = ({ stats, activities, loading }: { stats: DashboardStats, activities: ActivityItem[], loading: boolean }) => (
    <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Users size={24} /></div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</h4>
                    <p className="text-2xl font-black text-gray-800">{loading ? "..." : stats.totalUsers}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[var(--color-primary)]"><ClipboardList size={24} /></div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Horses</h4>
                    <p className="text-2xl font-black text-gray-800">{loading ? "..." : stats.activeHorses}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><CalendarDays size={24} /></div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Events</h4>
                    <p className="text-2xl font-black text-gray-800">{loading ? "..." : stats.liveEvents}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><Folders size={24} /></div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disciplines</h4>
                    <p className="text-2xl font-black text-gray-800">{loading ? "..." : stats.totalDisciplines}</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase">Recent Activity</h3>
            <div className="space-y-6">
                {loading ? (
                    <div className="py-8 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Loading Activity...</div>
                ) : activities.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No recent activity</div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><Activity size={18} /></div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                <p className="text-[10px] font-medium text-gray-400 uppercase">{item.time} • {item.type}</p>
                            </div>
                            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider">{item.status}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

interface AdminDashboardProps {
    user: any;
    profile: any;
}

export default function AdminDashboard({ user, profile }: AdminDashboardProps) {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeHorses: 0,
        liveEvents: 0,
        totalDisciplines: 0
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch counts
            const [
                { count: userCount },
                { count: horseCount },
                { count: eventCount },
                { count: disciplineCount },
                { data: recentPerformances }
            ] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("horses").select("*", { count: "exact", head: true }),
                supabase.from("events").select("*", { count: "exact", head: true }),
                supabase.from("disciplines").select("*", { count: "exact", head: true }),
                supabase.from("performances")
                    .select("*, horse:horses(name), event:events(name)")
                    .order("created_at", { ascending: false })
                    .limit(5)
            ]);

            setStats({
                totalUsers: userCount || 0,
                activeHorses: horseCount || 0,
                liveEvents: eventCount || 0,
                totalDisciplines: disciplineCount || 0
            });

            if (recentPerformances) {
                const formattedActivities: ActivityItem[] = recentPerformances.map((perf: any) => ({
                    id: perf.id,
                    title: `Performance logged for "${perf.horse?.name}" at ${perf.event?.name}`,
                    type: "Performance",
                    time: new Date(perf.created_at).toLocaleDateString(),
                    status: "Completed"
                }));
                setActivities(formattedActivities);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        if (activeTab === "dashboard") {
            fetchDashboardData();
        }
    }, [activeTab, fetchDashboardData]);

    const menuItems = [
        { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
        { id: "users", label: "USER MANAGEMENT", icon: Users },
        { id: "disciplines", label: "DISCIPLINES", icon: Folders },
        {
            id: "profiles",
            label: "PROFILES",
            icon: UserSquare2,
            subItems: [
                { id: "profile-user", label: "User Profiles" },
                { id: "profile-owner", label: "Horse Owner" },
                { id: "profile-rider", label: "Horse Rider" },
                { id: "profile-trainer", label: "Horse Trainer" },
                { id: "profile-producer", label: "Event Producer" }
            ]
        },
        { id: "horses", label: "HORSE MANAGEMENT", icon: ClipboardList },
        { id: "events", label: "EVENTS MANAGEMENT", icon: CalendarDays },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <AdminOverview stats={stats} activities={activities} loading={loading} />;
            case "users": return <AdminUserModule />;
            case "disciplines": return <AdminDisciplineModule />;
            case "profile-user": return <AdminProfileModule type="User" />;
            case "profile-owner": return <AdminProfileModule type="Owner" />;
            case "profile-rider": return <AdminProfileModule type="Rider" />;
            case "profile-trainer": return <AdminProfileModule type="Trainer" />;
            case "profile-producer": return <AdminProfileModule type="Producer" />;
            case "horses": return <AdminHorseModule />;
            case "events": return <AdminEventModule />;
            default: return <AdminOverview stats={stats} activities={activities} loading={loading} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-[#1a1b2e] text-white flex flex-col shadow-xl z-20">
                {/* Logo Area */}
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center font-black text-xl">
                        <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin Console</span>
                </div>

                {/* Nav Items */}
                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <div key={item.id}>
                            <button
                                onClick={() => {
                                    if (item.subItems) {
                                        setIsProfileOpen(!isProfileOpen);
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === item.id || (item.subItems && activeTab.startsWith("profile"))
                                    ? "bg-[var(--color-primary)] shadow-lg shadow-orange-900/20"
                                    : "hover:bg-gray-800 text-gray-400 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3 font-bold text-xs tracking-wider uppercase">
                                    <item.icon size={18} className={activeTab === item.id ? "text-white" : "group-hover:text-white"} />
                                    {item.label}
                                </div>
                                {item.subItems && (
                                    isProfileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </button>

                            {item.subItems && isProfileOpen && (
                                <div className="mt-1 ml-6 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                    {item.subItems.map((sub) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setActiveTab(sub.id)}
                                            className={`w-full text-left px-4 py-2 rounded-md text-[11px] font-bold transition-colors ${activeTab === sub.id
                                                ? "text-white bg-gray-800"
                                                : "text-gray-500 hover:text-white"
                                                }`}
                                        >
                                            • {sub.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Logout */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors font-bold text-xs uppercase"
                    >
                        <LogOut size={18} />
                        Exit Admin
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Viewport */}
                <main className="flex-1 overflow-y-auto bg-[#f8f9fc]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
