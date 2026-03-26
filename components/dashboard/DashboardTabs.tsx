"use client";

import { useState } from "react";
import ProfileModule from "./ProfileModule";
import HorseModule from "./HorseModule";
import PerformanceModule from "./PerformanceModule";
import { User, ClipboardList, TrendingUp, LayoutDashboard } from "lucide-react";

interface DashboardTabsProps {
    user: any;
    profile: any;
}

export default function DashboardTabs({ user, profile }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "profile", label: "My Profile", icon: User },
        { id: "horses", label: "My Horses", icon: ClipboardList },
        { id: "performances", label: "Performances", icon: TrendingUp },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-4 border-b border-gray-200 pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                ? "bg-[var(--color-primary)] text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Status</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-800">{profile?.full_name || "User"}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                        {/* Summary stats can be added here later */}
                    </div>
                )}

                {activeTab === "profile" && <ProfileModule user={user} profile={profile} />}
                {activeTab === "horses" && <HorseModule user={user} />}
                {activeTab === "performances" && <PerformanceModule user={user} />}
            </div>
        </div>
    );
}
