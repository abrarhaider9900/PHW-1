"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Horse, Trainer, Event, Discipline } from "@/types/database";
import { User, Lock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileModuleProps {
    user: any;
    profile: Profile | null;
}

export default function ProfileModule({ user, profile }: ProfileModuleProps) {
    const supabase = createClient();
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const { error } = await (supabase
                .from("profiles") as any)
                .update({ full_name: fullName, updated_at: new Date().toISOString() })
                .eq("id", user.id);


            if (error) throw error;
            setStatus({ type: 'success', message: "Profile updated successfully!" });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: "Passwords do not match!" });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setStatus({ type: 'success', message: "Password updated successfully!" });
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* Personal Details */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <User size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                        />
                        <p className="mt-1 text-[10px] text-gray-400 italic">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-sm"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-primary)] hover:bg-[#d98d1f] text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <Lock size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Security</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all outline-none text-sm"
                            placeholder="Min. 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all outline-none text-sm"
                            placeholder="Repeat new password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-accent)] hover:bg-[#23966d] text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                        Update Password
                    </button>
                </form>
            </div>

            {/* Status Feedback */}
            {status && (
                <div className={`col-span-1 md:col-span-2 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}
        </div>
    );
}
