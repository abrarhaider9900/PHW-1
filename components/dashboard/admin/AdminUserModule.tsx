"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Users,
    Shield,
    UserX,
    UserCheck,
    MoreHorizontal,
    Search,
    Filter,
    Tags,
    X,
    Check
} from "lucide-react";
import type { FunctionalRole, UserRole } from "@/types/database";

export default function AdminUserModule() {
    const supabase = createClient();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isAssigningRoles, setIsAssigningRoles] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await (supabase
            .from("profiles") as any)
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setUsers(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUser = async (userId: string, updates: any) => {
        const { error } = await (supabase
            .from("profiles") as any)
            .update(updates)
            .eq("id", userId);

        if (!error) {
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase">User Management</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage permissions, roles, and account statuses</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-3 w-64">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find user..."
                            className="bg-transparent border-none outline-none text-xs font-bold uppercase w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-bold uppercase outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">Loading Users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">No users found</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{user.full_name || 'No Name'}</p>
                                                {/* <p className="text-[10px] font-mono text-gray-400">{user.id}</p> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {(user.functional_roles || []).map((rol: string) => (
                                                    <span key={rol} className="px-1.5 py-0.5 bg-orange-50 text-[var(--color-primary)] text-[8px] font-black uppercase rounded border border-orange-100">
                                                        {rol}
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsAssigningRoles(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition-all"
                                                    title="Assign Functional Roles"
                                                >
                                                    <Tags size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'bg-green-100 text-green-700' :
                                            user.status === 'banned' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.status === 'active' ? (
                                                <button
                                                    onClick={() => updateUser(user.id, { status: 'banned' })}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Ban User"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => updateUser(user.id, { status: 'active' })}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Unban User"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            )}
                                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Role Assignment Modal */}
            {isAssigningRoles && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Assign Roles</h3>
                                    <p className="text-sm text-gray-500 font-medium">For {selectedUser.full_name}</p>
                                </div>
                                <button onClick={() => setIsAssigningRoles(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {["owner", "rider", "trainer", "producer"].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${(selectedUser.functional_roles || []).includes(role)
                                            ? 'bg-orange-50 border-orange-200 shadow-sm'
                                            : 'bg-gray-50/50 border-gray-100 hover:border-orange-100 hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${(selectedUser.functional_roles || []).includes(role)
                                                ? 'bg-[var(--color-primary)] text-white'
                                                : 'bg-white text-gray-400 border border-gray-100'
                                                }`}>
                                                {(selectedUser.functional_roles || []).includes(role) ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                                            </div>
                                            <span className={`font-black uppercase text-xs tracking-widest transition-colors ${(selectedUser.functional_roles || []).includes(role) ? 'text-[var(--color-primary)]' : 'text-gray-600'
                                                }`}>
                                                {role}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={(selectedUser.functional_roles || []).includes(role)}
                                            onChange={(e) => {
                                                const currentRoles = selectedUser.functional_roles || [];
                                                const newRoles = e.target.checked
                                                    ? [...currentRoles, role]
                                                    : currentRoles.filter((r: string) => r !== role);

                                                const updatedUser = { ...selectedUser, functional_roles: newRoles };
                                                setSelectedUser(updatedUser);
                                                updateUser(selectedUser.id, { functional_roles: newRoles });
                                            }}
                                        />
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsAssigningRoles(false)}
                                className="w-full mt-8 bg-gray-900 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl hover:bg-black transition-all shadow-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
